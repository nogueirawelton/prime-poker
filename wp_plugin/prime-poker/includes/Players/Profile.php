<?php
/**
 * Dados de perfil do jogador: contato, apresentação e foto.
 *
 * @package PrimePoker
 */

declare(strict_types=1);

namespace PrimePoker\Players;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * O perfil que o próprio jogador edita.
 *
 * O WordPress já guarda nome, e-mail e apresentação (`description`); o que
 * falta ao Prime Poker é o contato — WhatsApp e cidade — e uma foto que não
 * dependa do Gravatar, que quase ninguém do público tem.
 *
 * **Só o dono edita.** Nenhuma mutation aqui aceita ID de usuário: ela age
 * sempre sobre quem está logado. Tier, role e expiração NÃO entram — quem
 * muda plano é a equipe, pelo painel.
 *
 * A foto vira anexo da biblioteca de mídia e o ID fica em user meta. O filtro
 * de avatar faz o WordPress inteiro (painel, e-mails, comentários) usar essa
 * imagem, em vez de só o front headless saber dela.
 */
final class Profile {

	/** WhatsApp, só dígitos com DDI e DDD. */
	public const META_PHONE = '_prime_player_phone';

	/** Cidade/estado, texto livre. */
	public const META_CITY = '_prime_player_city';

	/** ID do anexo com a foto de perfil. */
	public const META_AVATAR = '_prime_player_avatar';

	/** Rota REST da foto: multipart não passa pelo GraphQL. */
	private const REST_NAMESPACE = 'prime-poker/v1';

	/**
	 * Tamanho máximo da foto enviada.
	 *
	 * Combina com o `bodySizeLimit` das Server Actions do Next. O PHP do
	 * servidor tem os limites dele (`upload_max_filesize`, `post_max_size`),
	 * que podem ser menores; quando são, é ele quem recusa primeiro, e a
	 * mensagem abaixo diz isso em vez de fingir que nada chegou.
	 */
	private const MAX_AVATAR_BYTES = 20 * MB_IN_BYTES;

	/** Formatos aceitos na foto. */
	private const AVATAR_TYPES = array( 'image/jpeg', 'image/png', 'image/webp' );

	/** Limites de texto, para um campo colado não virar um perfil de 1 MB. */
	private const MAX_NAME = 80;
	private const MAX_CITY = 80;
	private const MAX_BIO  = 600;

	/**
	 * Registra os hooks.
	 */
	public static function boot(): void {
		add_action( 'graphql_register_types', array( self::class, 'register_graphql' ) );
		add_action( 'rest_api_init', array( self::class, 'register_rest' ) );

		// `pre_get_avatar_data` e não `get_avatar_url`: o filtro de dados vale
		// para as duas saídas (URL e tag <img>) e continua respeitando o
		// tamanho pedido por quem chamou.
		add_filter( 'pre_get_avatar_data', array( self::class, 'avatar_data' ), 10, 2 );
	}

	/* ---------------------------------------------------------------------- */
	/*                                 GraphQL                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Declara os campos e as mutations.
	 */
	public static function register_graphql(): void {
		$fields = array(
			'playerPhone'     => array(
				'description' => __( 'WhatsApp do jogador, só dígitos.', 'prime-poker' ),
				'value'       => static fn( int $user_id ): string => (string) get_user_meta( $user_id, self::META_PHONE, true ),
			),
			'playerCity'      => array(
				'description' => __( 'Onde o jogador mora.', 'prime-poker' ),
				'value'       => static fn( int $user_id ): string => (string) get_user_meta( $user_id, self::META_CITY, true ),
			),
			'playerAvatarUrl' => array(
				'description' => __( 'Foto de perfil enviada pelo jogador, ou null se ele não enviou nenhuma.', 'prime-poker' ),
				'value'       => static fn( int $user_id ): string => (string) self::avatar_url( $user_id ),
			),
		);

		foreach ( $fields as $name => $field ) {
			register_graphql_field(
				'User',
				$name,
				array(
					'type'        => 'String',
					'description' => $field['description'],
					'resolve'     => static function ( $user ) use ( $field ) {
						$user_id = isset( $user->databaseId ) ? (int) $user->databaseId : 0;

						// Contato é dado pessoal: só o dono e quem administra
						// usuários leem. A foto acompanha a mesma regra por
						// simplicidade — ela só aparece na área logada.
						if ( 0 === $user_id || ( get_current_user_id() !== $user_id && ! current_user_can( 'list_users' ) ) ) {
							return null;
						}

						$value = $field['value']( $user_id );

						return '' === $value ? null : $value;
					},
				)
			);
		}

		register_graphql_mutation(
			'updatePlayerProfile',
			array(
				'description'         => __( 'Atualiza o perfil do jogador logado.', 'prime-poker' ),
				'inputFields'         => array(
					'name'  => array( 'type' => 'String' ),
					'email' => array( 'type' => 'String' ),
					'phone' => array( 'type' => 'String' ),
					'city'  => array( 'type' => 'String' ),
					'bio'   => array( 'type' => 'String' ),
				),
				'outputFields'        => array(
					'name'  => array( 'type' => 'String' ),
					'email' => array( 'type' => 'String' ),
					'phone' => array( 'type' => 'String' ),
					'city'  => array( 'type' => 'String' ),
					'bio'   => array( 'type' => 'String' ),
				),
				'mutateAndGetPayload' => static fn( array $input ): array => self::update( self::require_player(), $input ),
			)
		);

		register_graphql_mutation(
			'updatePlayerPassword',
			array(
				'description'         => __( 'Troca a senha do jogador logado.', 'prime-poker' ),
				'inputFields'         => array(
					'currentPassword' => array( 'type' => array( 'non_null' => 'String' ) ),
					'newPassword'     => array( 'type' => array( 'non_null' => 'String' ) ),
				),
				'outputFields'        => array(
					'success' => array( 'type' => 'Boolean' ),
				),
				'mutateAndGetPayload' => static function ( array $input ): array {
					self::change_password(
						self::require_player(),
						(string) $input['currentPassword'],
						(string) $input['newPassword']
					);

					return array( 'success' => true );
				},
			)
		);
	}

	/**
	 * O jogador logado, ou erro.
	 *
	 * @throws \GraphQL\Error\UserError Quando não há jogador na requisição.
	 */
	private static function require_player(): int {
		$user_id = get_current_user_id();

		if ( 0 === $user_id || ! self::can_edit_own_profile() ) {
			throw new \GraphQL\Error\UserError( __( 'Faça login para editar o seu perfil.', 'prime-poker' ) );
		}

		return $user_id;
	}

	/* ---------------------------------------------------------------------- */
	/*                                 Escrita                                */
	/* ---------------------------------------------------------------------- */

	/**
	 * Grava o que veio no input e devolve o perfil já salvo.
	 *
	 * Campo ausente do input fica como está: a tela de perfil pode salvar só
	 * uma seção sem apagar as outras. Campo presente e vazio LIMPA o valor —
	 * é como se apaga um telefone que não se usa mais. E-mail e nome fogem
	 * dessa regra: são obrigatórios, então vazio é recusado.
	 *
	 * @param int                  $user_id Jogador logado.
	 * @param array<string, mixed> $input   Campos recebidos.
	 * @return array<string, string>
	 * @throws \GraphQL\Error\UserError Quando um campo obrigatório não vem ou o e-mail já é de outra conta.
	 */
	private static function update( int $user_id, array $input ): array {
		$data = array( 'ID' => $user_id );

		if ( array_key_exists( 'name', $input ) ) {
			$name = self::text( (string) $input['name'], self::MAX_NAME );

			if ( '' === $name ) {
				throw new \GraphQL\Error\UserError( __( 'Informe o seu nome.', 'prime-poker' ) );
			}

			$parts = preg_split( '/\s+/', $name ) ?: array( $name );

			$data['display_name'] = $name;
			$data['first_name']   = (string) array_shift( $parts );
			$data['last_name']    = implode( ' ', $parts );
		}

		if ( array_key_exists( 'email', $input ) ) {
			$email = sanitize_email( (string) $input['email'] );

			if ( ! is_email( $email ) ) {
				throw new \GraphQL\Error\UserError( __( 'Informe um e-mail válido.', 'prime-poker' ) );
			}

			$owner = email_exists( $email );

			// `email_exists` acha o próprio jogador quando o e-mail não mudou.
			if ( false !== $owner && (int) $owner !== $user_id ) {
				throw new \GraphQL\Error\UserError( __( 'Este e-mail já está em uso por outra conta.', 'prime-poker' ) );
			}

			$data['user_email'] = $email;
		}

		if ( array_key_exists( 'bio', $input ) ) {
			$data['description'] = self::text( (string) $input['bio'], self::MAX_BIO );
		}

		if ( count( $data ) > 1 ) {
			$saved = wp_update_user( $data );

			if ( is_wp_error( $saved ) ) {
				throw new \GraphQL\Error\UserError( $saved->get_error_message() );
			}
		}

		if ( array_key_exists( 'phone', $input ) ) {
			self::save_meta( $user_id, self::META_PHONE, self::digits( (string) $input['phone'] ) );
		}

		if ( array_key_exists( 'city', $input ) ) {
			self::save_meta( $user_id, self::META_CITY, self::text( (string) $input['city'], self::MAX_CITY ) );
		}

		$user = get_userdata( $user_id );

		return array(
			'name'  => $user instanceof \WP_User ? $user->display_name : '',
			'email' => $user instanceof \WP_User ? $user->user_email : '',
			'bio'   => $user instanceof \WP_User ? $user->description : '',
			'phone' => (string) get_user_meta( $user_id, self::META_PHONE, true ),
			'city'  => (string) get_user_meta( $user_id, self::META_CITY, true ),
		);
	}

	/**
	 * Grava uma meta, ou apaga quando o valor fica vazio.
	 *
	 * Apagar em vez de guardar string vazia mantém `get_users` com
	 * `meta_query` funcionando como se espera: "quem não tem telefone" é
	 * quem não tem a meta.
	 *
	 * @param int    $user_id Jogador.
	 * @param string $key     Chave da meta.
	 * @param string $value   Valor já higienizado.
	 */
	private static function save_meta( int $user_id, string $key, string $value ): void {
		if ( '' === $value ) {
			delete_user_meta( $user_id, $key );

			return;
		}

		update_user_meta( $user_id, $key, $value );
	}

	/**
	 * Troca a senha, conferindo a atual.
	 *
	 * Pedir a senha atual não é burocracia: o token do jogador fica num
	 * cookie, e sem esta conferência quem pegasse o cookie trocaria a senha e
	 * tomaria a conta para sempre.
	 *
	 * @param int    $user_id  Jogador logado.
	 * @param string $current  Senha atual.
	 * @param string $new      Senha nova.
	 * @throws \GraphQL\Error\UserError Quando a senha atual não confere ou a nova é curta demais.
	 */
	private static function change_password( int $user_id, string $current, string $new ): void {
		$user = get_userdata( $user_id );

		if ( ! $user instanceof \WP_User || ! wp_check_password( $current, $user->user_pass, $user_id ) ) {
			throw new \GraphQL\Error\UserError( __( 'A senha atual não confere.', 'prime-poker' ) );
		}

		if ( strlen( $new ) < 8 ) {
			throw new \GraphQL\Error\UserError( __( 'A nova senha precisa ter ao menos 8 caracteres.', 'prime-poker' ) );
		}

		wp_set_password( $new, $user_id );

		/**
		 * A senha mudou por vontade do próprio jogador.
		 *
		 * @param int $user_id ID do jogador.
		 */
		do_action( 'prime_player_password_changed', $user_id );
	}

	/* ---------------------------------------------------------------------- */
	/*                                   Foto                                 */
	/* ---------------------------------------------------------------------- */

	/**
	 * Declara as rotas da foto.
	 *
	 * Fica no REST, e não no GraphQL, porque o envio é multipart: o WPGraphQL
	 * não recebe arquivo, e mandar a imagem em base64 dentro do JSON custaria
	 * um terço a mais de tráfego e memória.
	 */
	public static function register_rest(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			'/avatar',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( self::class, 'upload_avatar' ),
					'permission_callback' => array( self::class, 'can_edit_own_profile' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( self::class, 'delete_avatar' ),
					'permission_callback' => array( self::class, 'can_edit_own_profile' ),
				),
			)
		);
	}

	/**
	 * Quem pode mexer no próprio perfil.
	 *
	 * Jogador de qualquer tier **e a equipe**. O `edit_posts` não é detalhe:
	 * quem administra o site não tem `access_player_area` — as capabilities de
	 * jogador vivem nas roles de tier — e sem esta segunda porta um membro da
	 * equipe logado na área recebia "faça login" ao salvar o próprio perfil. É
	 * a mesma dupla que `Lessons\Access::can_browse()` usa, pelo mesmo motivo.
	 *
	 * Serve às duas entradas: a rota REST da foto e as mutations do GraphQL.
	 * O usuário chega pelo mesmo Bearer nas duas — o plugin de JWT resolve
	 * `determine_current_user`, que vale para o REST também.
	 *
	 * Note que isto responde "pode editar um perfil", não "qual perfil": todas
	 * as escritas agem sobre `get_current_user_id()` e não aceitam ID de
	 * usuário, então ninguém edita a conta de outro.
	 */
	public static function can_edit_own_profile(): bool {
		return is_user_logged_in()
			&& ( current_user_can( Tiers::CAP_PLAYER_AREA ) || current_user_can( 'edit_posts' ) );
	}

	/**
	 * Recebe a foto e a guarda como anexo.
	 *
	 * @param \WP_REST_Request $request Requisição multipart com o campo `file`.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function upload_avatar( \WP_REST_Request $request ) {
		$files = $request->get_file_params();
		$file  = $files['file'] ?? null;

		$upload_error = is_array( $file ) ? (int) ( $file['error'] ?? UPLOAD_ERR_NO_FILE ) : UPLOAD_ERR_NO_FILE;

		// O PHP corta o arquivo grande demais ANTES do código rodar, e o que
		// sobra em `$_FILES` é só este código de erro. Sem separá-lo do
		// "nenhuma imagem", quem mandasse uma foto grande leria que nada
		// chegou — e ficaria tentando de novo com o mesmo arquivo.
		if ( UPLOAD_ERR_INI_SIZE === $upload_error || UPLOAD_ERR_FORM_SIZE === $upload_error ) {
			return new \WP_Error(
				'prime_avatar_too_big',
				sprintf(
					/* translators: %s: tamanho máximo aceito pelo servidor, já formatado. */
					__( 'A imagem passou do limite do servidor (%s). Envie uma menor.', 'prime-poker' ),
					size_format( wp_max_upload_size() )
				),
				array( 'status' => 413 )
			);
		}

		if ( ! is_array( $file ) || ! isset( $file['tmp_name'] ) || UPLOAD_ERR_OK !== $upload_error ) {
			return new \WP_Error( 'prime_avatar_missing', __( 'Nenhuma imagem recebida.', 'prime-poker' ), array( 'status' => 400 ) );
		}

		if ( (int) ( $file['size'] ?? 0 ) > self::MAX_AVATAR_BYTES ) {
			return new \WP_Error(
				'prime_avatar_too_big',
				sprintf(
					/* translators: %s: tamanho máximo, já formatado. */
					__( 'A imagem precisa ter no máximo %s.', 'prime-poker' ),
					size_format( self::MAX_AVATAR_BYTES )
				),
				array( 'status' => 413 )
			);
		}

		// O tipo vai pelo conteúdo do arquivo, nunca pelo `type` do upload:
		// esse cabeçalho é escrito pelo cliente e pode dizer qualquer coisa.
		$checked = wp_check_filetype_and_ext( (string) $file['tmp_name'], (string) ( $file['name'] ?? '' ) );

		if ( ! in_array( (string) ( $checked['type'] ?? '' ), self::AVATAR_TYPES, true ) ) {
			return new \WP_Error( 'prime_avatar_type', __( 'Envie uma imagem JPG, PNG ou WebP.', 'prime-poker' ), array( 'status' => 415 ) );
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$user_id = get_current_user_id();

		// `media_handle_upload` não confere capability — quem barra o envio é
		// o `permission_callback` da rota. O jogador segue SEM `upload_files`:
		// dar essa capability ao tier abriria a biblioteca de mídia inteira
		// para ele, e aqui só esta rota escreve.
		$attachment_id = media_handle_upload(
			'file',
			0,
			array(
				'post_author' => $user_id,
				'post_title'  => sprintf(
					/* translators: %s: nome do jogador. */
					__( 'Foto de perfil de %s', 'prime-poker' ),
					(string) ( get_userdata( $user_id )->display_name ?? '' )
				),
			)
		);

		if ( is_wp_error( $attachment_id ) ) {
			return new \WP_Error( 'prime_avatar_failed', $attachment_id->get_error_message(), array( 'status' => 500 ) );
		}

		self::replace_avatar( $user_id, (int) $attachment_id );

		return new \WP_REST_Response( array( 'url' => self::avatar_url( $user_id ) ), 200 );
	}

	/**
	 * Apaga a foto e volta ao avatar padrão.
	 *
	 * @return \WP_REST_Response
	 */
	public static function delete_avatar(): \WP_REST_Response {
		self::replace_avatar( get_current_user_id(), 0 );

		return new \WP_REST_Response( array( 'url' => null ), 200 );
	}

	/**
	 * Troca a foto do jogador, jogando fora a anterior.
	 *
	 * A antiga vai embora de propósito: sem isso, cada troca deixaria um
	 * arquivo órfão na biblioteca, que ninguém veria para limpar depois.
	 *
	 * @param int $user_id       Jogador.
	 * @param int $attachment_id Novo anexo, ou 0 para remover.
	 */
	private static function replace_avatar( int $user_id, int $attachment_id ): void {
		$previous = (int) get_user_meta( $user_id, self::META_AVATAR, true );

		if ( $previous > 0 && $previous !== $attachment_id ) {
			wp_delete_attachment( $previous, true );
		}

		if ( $attachment_id > 0 ) {
			update_user_meta( $user_id, self::META_AVATAR, $attachment_id );

			return;
		}

		delete_user_meta( $user_id, self::META_AVATAR );
	}

	/**
	 * URL da foto enviada pelo jogador, ou vazio.
	 *
	 * Pública porque as dúvidas das aulas também mostram a foto de quem
	 * escreveu, e ali interessa distinguir "não enviou foto" de "enviou": o
	 * `get_avatar_url()` do WordPress nunca volta vazio — sem Gravatar, ele
	 * devolve a silhueta cinza, e a conversa ficaria com uma fileira delas no
	 * lugar das iniciais.
	 *
	 * @param int $user_id Jogador.
	 */
	public static function avatar_url( int $user_id ): string {
		$attachment_id = (int) get_user_meta( $user_id, self::META_AVATAR, true );

		if ( $attachment_id <= 0 ) {
			return '';
		}

		$url = wp_get_attachment_image_url( $attachment_id, 'thumbnail' );

		return is_string( $url ) ? $url : '';
	}

	/**
	 * Faz o WordPress inteiro usar a foto enviada.
	 *
	 * Sem isto, só o front headless saberia da imagem: o painel, a lista de
	 * usuários e os e-mails continuariam no Gravatar.
	 *
	 * @param array<string, mixed> $args        Dados do avatar.
	 * @param mixed                $id_or_email Usuário, e-mail, comentário...
	 * @return array<string, mixed>
	 */
	public static function avatar_data( $args, $id_or_email ) {
		$user_id = self::user_from( $id_or_email );
		$url     = $user_id > 0 ? self::avatar_url( $user_id ) : '';

		if ( '' === $url ) {
			return $args;
		}

		$args['url']          = $url;
		$args['found_avatar'] = true;

		return $args;
	}

	/**
	 * Descobre de qual usuário é o avatar pedido.
	 *
	 * @param mixed $id_or_email O que veio para `get_avatar_data()`.
	 */
	private static function user_from( $id_or_email ): int {
		if ( is_numeric( $id_or_email ) ) {
			return (int) $id_or_email;
		}

		if ( $id_or_email instanceof \WP_User ) {
			return (int) $id_or_email->ID;
		}

		if ( $id_or_email instanceof \WP_Comment ) {
			return (int) $id_or_email->user_id;
		}

		if ( is_string( $id_or_email ) && is_email( $id_or_email ) ) {
			$user = get_user_by( 'email', $id_or_email );

			return $user instanceof \WP_User ? (int) $user->ID : 0;
		}

		return 0;
	}

	/* ---------------------------------------------------------------------- */
	/*                               Higienização                             */
	/* ---------------------------------------------------------------------- */

	/**
	 * Texto de uma linha, sem HTML e com tamanho máximo.
	 *
	 * @param string $value Valor recebido.
	 * @param int    $max   Limite de caracteres.
	 */
	private static function text( string $value, int $max ): string {
		$clean = trim( wp_strip_all_tags( $value ) );

		return mb_substr( $clean, 0, $max );
	}

	/**
	 * Só os dígitos de um telefone.
	 *
	 * O front manda com DDI e DDD; máscara, parênteses e traço não precisam
	 * viajar até o banco.
	 *
	 * @param string $value Valor recebido.
	 */
	private static function digits( string $value ): string {
		return (string) preg_replace( '/\D+/', '', $value );
	}
}

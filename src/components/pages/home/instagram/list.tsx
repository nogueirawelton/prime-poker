import { Post } from "./post";

export async function List() {
  const { posts }: { posts: Array<any> } = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_INSTAGRAM_URL}/api/profiles/${process.env.NEXT_PUBLIC_INSTAGRAM_PROFILE}`,
      {
        next: {
          revalidate: 60 * 60 * 24,
        },
      },
    )
  ).json();

  return (
    <div className="mt-12 grid gap-2 lg:grid-cols-4">
      {posts?.slice(0, 4).map((post, key) => (
        <div key={key} className="aspect-square">
          <Post content={post} />
        </div>
      ))}
    </div>
  );
}

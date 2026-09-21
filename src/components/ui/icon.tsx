/**
 * A entrada do logo é 100% CSS (`animate-intro-*`, em globals.css).
 *
 * Antes cada parte nascia com `opacity: 0` e era revelada pelo GSAP — o que
 * amarrava a abertura ao download da biblioteca. Com keyframes o desenho
 * aparece no primeiro frame pintado, sem depender de JS nenhum.
 */

export function Icon() {
  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.2"
        viewBox="0 0 201 181"
        width="201"
        height="181"
        className="h-auto w-[145px]"
      >
        <defs>
          <image
            width="118"
            height="128"
            id="img1"
            href="data:image/png;base64,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"
          />
          <image
            width="200"
            height="22"
            id="img2"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAWCAMAAACysiPzAAAAAXNSR0IB2cksfwAAAppQTFRF////////////////////////AAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////80wktQAAAN50Uk5Tl5qVdDEBABeRaSFYoIUNFZZDAmSKJYJZiFMLG1aAlHlGDF2lkkCMBz2JXBb6/+ycIOARjdUj9+Y4AGP05Tvy0JPJRy/h+/bSeh2Q6BKpmQnfZfxaBcoE2kz17lFm69REBqxneDnk2Bp9+EID/g/wHLp1vdbRrgoU3Jhte2KraMTjKf28nl/nfjS+2xm5Sx9KsnZV78ckSFKkhHP56syjptcOcjA1yDfx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"
          />
          <image
            width="56"
            height="14"
            id="img3"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAOCAMAAABNey+cAAAAAXNSR0IB2cksfwAAAV9QTFRF5h4l5h4l5h4lAAAA5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h0l5CAl5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5yAk5h4l5h4l5h4l5h4l5h4l5h4m5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l5h4l1glnMgAAAHV0Uk5TOtV8AIUSi4Rd0FlMzyNF/5WgFSDj3Rhz70oAAD7qKzva93/nbf79YzAn28VYwfa33xwW0yL5pK+xDUeGP3r8nQGM5FUQ1wMG6Ap+kYJyn3b7ePhOu8cJcK3xM6MEytQkLuymqPDrKjR5bETCDvoDqo85Ql9mZ2QFgAAAAZJJREFUeJxjZGBkgANGRsa/MDbLPxDJ/JuB7Q+Yz8rI+BOukAOokg9Z42e+fzA280cgIcAI1Mj4FsQX+cHJyPgSLCXByPiJn1EepJHxHQMbNwMD00OgRhGIpU9BRigyvmIQZ7wD0cjAKnIbLKXG+JSBn5EZxNR4ArGBAahR9jrCCVqP5BkeKlyBagSacwnI0geZhF+jIeMtdcYb8i/eQjUyaJ79x2D29yYDVo2sIGWWJ0E8iysMune/MegdgzpV64Uk42G7vy9kzmLTCAYmB4CEI+MpNkNGxuN/bXeBNVozHmGwZTzEYM94AL+N7G77nTYxMHI7M24Aa9Tj4t2tL7TfjZFxB14/ughu9zr6lCH8ykMfxuVgjcf0dDYx+DMuCcGvMfbntiDG9QxBjKvDjtyCaGRIXsfpNYeBgMbU5fDgjZoF1cgg4z2TAYfGmA9gtYK377yJ2wBmKl6UdpkK1QgG2DXCkpzGVQaDyxA3L2D4yIxdo/FpaKJGSuTZE2OFJ4GZ+f0M3tsL+hiK+6FyrD8ZeACw/6CRqEKAQgAAAABJRU5ErkJggg=="
          />
        </defs>

        <foreignObject x="0" y="0" width="201" height="181">
          <div
            id="icon"
            className="mx-auto h-[118px] w-[117px] animate-intro-icon"
          >
            <svg width="118" height="128">
              <use href="#img1" x="0" y="0" />
            </svg>
          </div>
        </foreignObject>

        <use
          id="name"
          href="#img2"
          x="0"
          y="139"
          className="animate-intro-name"
        />
        <use
          id="team"
          href="#img3"
          x="145"
          y="167"
          className="animate-intro-team"
        />
      </svg>
    </div>
  );
}

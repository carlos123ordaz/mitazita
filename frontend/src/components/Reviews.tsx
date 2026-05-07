import { REVIEWS } from '../data';

export default function Reviews() {
  return (
    <>
      {REVIEWS.map((r, i) => (
        <div key={i} className="review">
          <div className="stars">
            {Array.from({ length: r.stars }).map((_, s) => (
              <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z" />
              </svg>
            ))}
          </div>
          <p className="review-quote">"{r.quote}"</p>
          <div className="review-who">
            <div className="review-avatar">{r.initial}</div>
            <div>
              <div className="review-name">{r.name}</div>
              <div className="review-loc">{r.loc}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

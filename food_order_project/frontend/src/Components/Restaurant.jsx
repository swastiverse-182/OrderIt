import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteRestaurant, analyzeReviews } from "../redux/actions/restaurantAction";

const Restaurant = ({ restaurant }) => {
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector(
    (state) => state.user || {}
  );

  // DELETE HANDLER
  const handleDelete = () => {
    if (!window.confirm("Delete this restaurant?")) return;
    dispatch(deleteRestaurant(restaurant._id)).catch(() => {
      alert("Unable to delete");
    });
  };

  // ANALYZE HANDLER
  const handleAnalyze = () => {
    dispatch(analyzeReviews(restaurant._id));
  };

  return (
    <div className="col-sm-12 col-md-6 col-lg-3 my-3">
      <div className="card p-3 rounded">
        <Link to={`/eats/stores/${restaurant._id}/menus`}>
          <img
            className="card-img-top mx-auto"
            src={restaurant.images?.[0]?.url}
            alt={restaurant.name}
          />
        </Link>

        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{restaurant.name}</h5>
          <p className="rest_address">{restaurant.address}</p>

          {/* Ratings */}
          <div className="ratings mt-auto">
            <div className="rating-outer">
              <div
                className="rating-inner"
                style={{
                  width: `${(restaurant.ratings / 5) * 100}%`,
                }}
              ></div>
            </div>
            <span>({restaurant.numOfReviews} Reviews)</span>
          </div>

          {/* AI INSIGHTS (Visible if data exists and user is a 'user') */}
          {user?.role === "user" && restaurant.reviewSentiment && (
            <div className="mt-2 p-2 border rounded bg-light ai-insights">
              <p className="mb-1"><strong><i className="fa fa-robot"></i> AI Insights</strong></p>

              <p className="mb-1 small">
                Sentiment: <b className={restaurant.reviewSentiment === 'positive' ? 'text-success' : 'text-danger'}>
                  {restaurant.reviewSentiment}
                </b>
              </p>

              <ul className="mb-1 pl-3 small">
                {(restaurant.reviewSummaryBullets || []).map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>

              <div className="mt-1">
                <small className="text-muted">
                  Top Mentions: {(restaurant.reviewTopMentions || []).join(", ")}
                </small>
              </div>
            </div>
          )}

          {/* ADMIN CONTROLS */}
          {isAuthenticated && user?.role === "admin" && (
            <div className="admin-buttons d-flex flex-column mt-2">
              <button
                className="btn btn-primary btn-sm mb-2"
                onClick={handleAnalyze}
              >
                <i className="fa fa-magic"></i> Analyze Reviews (AI)
              </button>
              
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
              >
                <i className="fa fa-trash"></i> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
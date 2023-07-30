import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetMenuItemByIdQuery } from "../Apis/menuItemApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../Storage/Redux/store";
import { useUpdateShoppingCartMutation } from "../Apis/shoppingCartApi";
import { MainLoader, MiniLoader } from "../Components/Page/Common";
import { apiResponse, userModel } from "../Interfaces";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StarRating from "../StarRating";

function MenuItemDetails() {
  const { menuItemId } = useParams<{ menuItemId: string }>();
  const { data, isLoading } = useGetMenuItemByIdQuery(Number(menuItemId));
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [updateShoppingCart] = useUpdateShoppingCartMutation();
  const userData: userModel = useSelector(
    (state: RootState) => state.userAuthStore
  );

  const handleQuantity = (counter: number) => {
    let newQuantity = quantity + counter;
    if (newQuantity === 0) {
      newQuantity = 1;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async (menuItemId: number) => {
    if (!userData.id) {
      navigate("/login");
      return;
    }
    setIsAddingToCart(true);
    const response: apiResponse = await updateShoppingCart({
      menuItemId: menuItemId,
      updateQuantityBy: quantity,
      userId: userData.id,
    });

    if (response.data && response.data.isSuccess) {
      toast.success("Item added to cart successfully!");
    }
    setIsAddingToCart(false);
  };

  const [reviews, setReviews] = useState<{ [key: string]: string[] }>({});
  const [newReview, setNewReview] = useState("");

  useEffect(() => {
    const storedReviews = localStorage.getItem("reviews");
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview(e.target.value);
  };

  const handleReviewSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newReview.trim() !== "") {
      setReviews((prevReviews) => ({
        ...prevReviews,
        [menuItemId ?? ""]: [...(prevReviews[menuItemId ?? ""] || []), newReview],
      }));
      setNewReview("");
      toast.success("Review submitted successfully!");
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center" style={{ width: "100%" }}>
        <MainLoader />
      </div>
    );
  }

  return (
    <div className="container pt-4 pt-md-5">
      <div className="row">
        <div className="col-7">
          <h2 className="text-success">{data?.result?.name}</h2>
          <span>
            <span
              className="badge text-bg-dark pt-2"
              style={{ height: "40px", fontSize: "20px" }}
            >
              {data?.result?.category}
            </span>
          </span>
          <div>
            <h2>Customer Reviews</h2>
            {!menuItemId || reviews[menuItemId]?.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <ul>
                {reviews[menuItemId]?.map((review: string, index: number) => (
                  <li key={index}>{review}</li>
                ))}
              </ul>
            )}
          </div>
          {userData.id && (
            <div className="mt-5">
              <form onSubmit={handleReviewSubmit}>
                <textarea
                  value={newReview}
                  className="form-control"
                  placeholder="Post Review!"
                  onChange={handleReviewChange}
                />
                <button className="btn btn-success flex-column" type="submit">
                  Submit Review
                </button>
              </form>
            </div>
          )}
          <span>
            <span
              className="badge text-bg-light pt-2"
              style={{ height: "40px", fontSize: "20px" }}
            >
              {data?.result?.specialTag}
            </span>
          </span>
          <StarRating productId={menuItemId} />
          <p style={{ fontSize: "20px" }} className="pt-2">
            {data?.result?.description}
          </p>
          <span className="h3">${data?.result?.price}</span> &nbsp;&nbsp;&nbsp;
          <span
            className="pb-2  p-3"
            style={{ border: "1px solid #333", borderRadius: "30px" }}
          >
            <i
              onClick={() => {
                handleQuantity(-1);
              }}
              className="bi bi-dash p-1"
              style={{ fontSize: "25px", cursor: "pointer" }}
            ></i>
            <span className="h3 mt-3 px-3">{quantity}</span>
            <i
              className="bi bi-plus p-1"
              onClick={() => {
                handleQuantity(+1);
              }}
              style={{ fontSize: "25px", cursor: "pointer" }}
            ></i>
          </span>
          <div className="row pt-4">
            <div className="col-5">
              {isAddingToCart ? (
                <button disabled className="btn btn-success form-control">
                  <MiniLoader />
                </button>
              ) : (
                <button
                  className="btn btn-success form-control"
                  onClick={() => handleAddToCart(data?.result?.id)}
                >
                  Add to Cart
                </button>
              )}
            </div>
            <div className="col-5 ">
              <button
                className="btn btn-secondary form-control"
                onClick={() => navigate(-1)}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
        <div className="col-5">
          <img
            src={data?.result?.image}
            width="100%"
            style={{ borderRadius: "50%" }}
            alt="No content"
          ></img>
        </div>
      </div>
      <ToastContainer /> {/* Add ToastContainer component for displaying toast notifications */}
    </div>
  );
}

export default MenuItemDetails;

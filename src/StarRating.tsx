import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from "./Storage/Redux/store";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface StarRatingProps {
    productId?: string;
  }

const StarRating: React.FC<StarRatingProps> = ({ productId }) => {
  const [rating, setRating] = useState<number | null>(0);
  const [hover, setHover] = useState<number | null>(0);

  const userData = useSelector((state: RootState) => state.userAuthStore);
  const isUserLoggedIn = !!userData.id; // Check if user is logged in

  useEffect(() => {
    const storedRating = localStorage.getItem(`rating-${productId}`);
    if (storedRating) {
      setRating(Number(storedRating));
    }
  }, [productId]);

  useEffect(() => {
    if (rating !== null) {
      localStorage.setItem(`rating-${productId}`, String(rating));
    }
  }, [productId, rating]);

  const handleRatingChange = (ratingValue: number) => {
    if (isUserLoggedIn) {
      setRating(ratingValue);
      toast.success('Your star rating submitted successfully!'); // Display success toast notification

    }
  };

  return (
    <div>
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <label key={i}>
            <input
              type="radio"
              name={`rating-${productId}`}
              value={ratingValue}
              checked={ratingValue === rating}
              onChange={() => handleRatingChange(ratingValue)}
              disabled={!isUserLoggedIn} // Disable input if user is not logged in
            />
            <FaStar
              className="star"
              color={ratingValue <= (hover || rating || 0) ? '#ffc107' : '#e4e5e9'}
              size={60}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(0)}
            />
          </label>
        );
      })}
      <p>You rated {rating !== null ? rating : 'N/A'} stars &#128525;</p>
    </div>
  );
};

export default StarRating;

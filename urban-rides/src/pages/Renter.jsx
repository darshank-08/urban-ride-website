import React, { useState, useEffect } from "react";
import styles from "./Renter.module.css";
import Hamburger from "../components/Hamburger";
import CarCard from "../components/CarCard.jsx";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

const Renter = () => {
  const [open, setOpen] = useState(false);
  const [cars, setCars] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [seats, setSeats] = useState("");
  const [brand, setBrand] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState(false);
  const [comment, setComment] = useState(""); 
  const [ratingMap, setRatingMap] = useState({});
  const [bookingClick, setBookingClick] = useState(false);

  const Name = localStorage.getItem("user")
  const navigate = useNavigate();

  const API = {
    testAPI: "http://localhost:8080/Renter/active-cars",
    prodAPI: "https://urban-rides.onrender.com/Renter/active-cars",
  };

  const myBookingAPI = {
    testAPI: "http://localhost:8080/Renter/my-Bookings",
    prodAPI: "https://urban-rides.onrender.com/Renter/my-Bookings",
  };

  const cancelAPI = {
    testAPI: "http://localhost:8080/Renter/cancel-booking",
    prodAPI: "https://urban-rides.onrender.com/Renter/cancel-booking",
  };

  const ratingAPI = {
    testAPI: "http://localhost:8080/Renter/submit-rating",
    prodAPI: "https://urban-rides.onrender.com/Renter/submit-rating",
  };

  const myRatingsAPI = {
    testAPI: "http://localhost:8080/Renter/my-ratings",
    prodAPI: "https://urban-rides.onrender.com/Renter/my-ratings",
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(API.prodAPI, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCars(data);
        console.log("Fetched Cars:", data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(myBookingAPI.prodAPI, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        console.log("Full API Response:", data);

        const bookingsArray = Array.isArray(data.body) ? data.body : [];
        setMyBookings(bookingsArray);

      } catch (err) {
        console.error("Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  const onCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${cancelAPI.testAPI}/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      setMyBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );

      alert("Booking cancelled successfully!");
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Something went wrong!");
    }
  };

  const submitRating = async (bookingId, carId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(ratingAPI.prodAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          carId,
          score: stars,
        }),
      });

      if (!response.ok) throw new Error("Rating failed");

      alert("Thank you for your rating!");

      setRatingMap((prev) => ({
        ...prev,
        [bookingId]: stars,
      }));

      setSelectedBooking(null);
      setStars(0);

    } catch (err) {
      alert("Error submitting rating");
      console.log("Rating error:", err);
    }
  };

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(myRatingsAPI.prodAPI, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error();

        const ratings = await response.json();

        const ratingMap = {};

        ratings.forEach((rating) => {
          ratingMap[rating.bookingId] = rating.score;
        });

        setRatingMap(ratingMap);

      } catch (error) {
        console.error("Error fetching ratings:", error);
        setRatingMap({});
      }
    };

    fetchRatings();
  }, []);

  // Filter Functions

  const filterByPrice = (car) => {
    if (!priceRange) return true;
    const price = car.pricePerDay;
    if (priceRange === "0-2000") return price < 2000;
    if (priceRange === "2000-3000") return price >= 2000 && price <= 3000;
    if (priceRange === "3000-5000") return price > 3000 && price <= 5000;
    if (priceRange === "5000+") return price > 5000;
    return true;
  };

  const filterBySeats = (car) => {
    if (!seats) return true;
    if (seats === "4") return car.seats === 4;
    if (seats === "5") return car.seats === 5;
    if (seats === "6+") return car.seats >= 6;
    return true;
  };

  const filterByBrand = (car) => {
    if (!brand) return true;
    return car.company.toLowerCase().includes(brand.toLowerCase());
  };

  const filteredCars = cars.filter(
    (car) =>
      car.location.toLowerCase().includes(location.toLowerCase()) &&
      filterByBrand(car) &&
      filterByPrice(car) &&
      filterBySeats(car)
  );

  // Navigation Handlers

  const handleReviewClick = () => {
    setOpen(false);
    setBookingClick(false);
    setReview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMyBookingsClick = () => {
    setOpen(false);
    setReview(false);
    setBookingClick(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToAvailableCars = () => {
    setOpen(false);
    setBookingClick(false);
    setReview(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const logoutHandler = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("token");
    navigate("/login");
  };

  const onCardClick = (carId) => {
    navigate(`/cars/${carId}`);
  };

  const user = localStorage.getItem("user");

  const profileHandler = () => {
    navigate("/Profile");
  };

  const getBookingType = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (today < start) return "Upcoming";
    if (today > end) return "Completed";
    return "Ongoing";
  };

  if (loading) return <p className={styles.loading}>Loading cars…</p>;
  if (error) return <p className={styles.error}>Cars are not available.</p>;

  return (
    <div className={styles.main}>
      <div className={styles.navigation}>
        {!open && <Hamburger onClick={() => setOpen(true)} />}
        <div className={`${styles.navigationContent} ${open ? styles.show : ""}`}>
          <div className={styles.navHeader}>
            <h2>RENT</h2>
            <span className={styles.close} onClick={() => setOpen(false)}>✕</span>
          </div>

          <ul className={styles.navMenu}>
            <li onClick={goToAvailableCars}>Available Cars</li>
            <li onClick={handleMyBookingsClick}>My Bookings</li>
            <li onClick={handleReviewClick}>Review</li>
          </ul>

          <div className={styles.navFooter}>
            <ul className={styles.navFooterMenu}>
              <li className={styles.navFooterprofile} onClick={profileHandler}>
                <FaUserCircle />
                <div className={styles.profilePreview}>
                  <div className={styles.profilePreviewName}>{user}</div>
                  <div className={styles.profilePreviewEdit}>Edit profile</div>
                </div>
              </li>

              <li className={styles.navFooterlogout} onClick={logoutHandler}>
                <FiLogOut />
                <span>logout</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          {bookingClick ? (
            <h2>My Bookings</h2>
          ) : review ? (
            <h2>Review Completed Rides</h2>
          ) : (
            <h2>Available Cars</h2>
          )}
          {!bookingClick && !review && <p>Choose the perfect ride for your journey.</p>}
        </div>

        {!bookingClick && !review && (
          <div className={styles.filters}>
            <input
              type="text"
              placeholder="Location"
              className={styles.input}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <select
              className={styles.select}
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
            >
              <option value="">Price</option>
              <option value="0-2000">Below 2000</option>
              <option value="2000-3000">2000 - 3000</option>
              <option value="3000-5000">3000 - 5000</option>
              <option value="5000+">5000+</option>
            </select>

            <select
              className={styles.select}
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            >
              <option value="">Seats</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6+">6+</option>
            </select>

            <input
              type="text"
              placeholder="Brand (e.g. BMW)"
              className={styles.input}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        )}

        {bookingClick ? (
          myBookings && myBookings.length > 0 ? (
            <div className={styles.cardsWrapper}>
              {myBookings.map((booking) => (
                <div key={booking.id} className={styles.bookingCard}>
                  <div className={styles.bookingImage}>
                    <img
                      src={
                        booking.carImages?.[0] ||
                        "https://via.placeholder.com/300x200?text=No+Image"
                      }
                      alt="Car"
                    />
                  </div>

                  <div className={styles.bookingDetails}>
                    <p><strong>Owner:</strong> {Name}</p>

                    <div className={styles.bookingDates}>
                      <p>
                        <strong>From:</strong>{" "}
                        {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>To:</strong>{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <p><strong>Total:</strong> ₹ {booking.totalPrice}</p>

                    <div className={styles.cencleRow}>
                      <p>
                        <strong>Status: </strong>
                        {booking.status === "CANCELLED" ? (
                          <span className={styles.cancelled}>CANCELLED</span>
                        ) : (
                          <span
                            className={
                              getBookingType(booking.startDate, booking.endDate) === "Upcoming"
                                ? styles.upcoming
                                : getBookingType(booking.startDate, booking.endDate) === "Ongoing"
                                ? styles.ongoing
                                : styles.completed
                            }
                          >
                            {getBookingType(booking.startDate, booking.endDate)}
                          </span>
                        )}
                      </p>

                      {booking.status !== "CANCELLED" &&
                        (() => {
                          const type = getBookingType(
                            booking.startDate,
                            booking.endDate
                          );

                          return (
                            <button
                              className={
                                type === "Upcoming"
                                  ? styles.cancelBtnActive
                                  : styles.cancelBtnDisabled
                              }
                              disabled={type !== "Upcoming"}
                              onClick={() => onCancel(booking.id)}
                            >
                              Cancel
                            </button>
                          );
                        })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.cardsWrapper}>
              <p style={{ color: "black" }}>No bookings available right now.</p>
            </div>
          )
          ) : review ? (
            <div className={styles.cardsWrapper}>
              {myBookings.filter(
                (booking) =>
                  booking.status !== "CANCELLED" &&
                  getBookingType(booking.startDate, booking.endDate) === "Completed"
              ).length > 0 ? (
                myBookings
                  .filter(
                    (booking) =>
                      booking.status !== "CANCELLED" &&
                      getBookingType(booking.startDate, booking.endDate) === "Completed"
                  )
                  .map((booking) => {
                    const existingScore = ratingMap[booking.id];

                    return (
                      <div key={booking.id} className={styles.bookingCard}>
                        <div className={styles.bookingImage}>
                          <img
                            src={
                              booking.carImages?.[0] ||
                              "https://via.placeholder.com/300x200?text=No+Image"
                            }
                            alt="Car"
                          />
                        </div>

                        <div className={styles.bookingDetails}>
                          <p>
                            <strong>From:</strong>{" "}
                            {new Date(booking.startDate).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>To:</strong>{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>

                          <div style={{ marginTop: "10px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                onClick={() => {
                                  if (existingScore) return;

                                  if (selectedBooking?.id !== booking.id) {
                                    setStars(0);
                                  }

                                  setSelectedBooking(booking);
                                  setStars(star);
                                }}
                                style={{
                                  cursor: existingScore ? "default" : "pointer",
                                  fontSize: "28px",
                                  margin: "5px",
                                  color:
                                    star <=
                                    (existingScore ||
                                      (selectedBooking?.id === booking.id ? stars : 0))
                                      ? "gold"
                                      : "gray",
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>

                          {existingScore ? (
                            <p style={{ color: "green", marginTop: "10px" }}>
                              Already Rated ✅
                            </p>
                          ) : (
                            <button
                              className={styles.submitBtn}
                              onClick={() => {
                                if (!selectedBooking || stars === 0) {
                                  alert("Please select rating");
                                  return;
                                }
                                submitRating(booking.id, booking.carId);
                              }}
                            >
                              Submit Rating
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <p style={{ color: "black" }}>
                  No completed bookings available for review.
                </p>
              )}
            </div>
        ) : (
          <div className={styles.cardsWrapper}>
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onClick={() => onCardClick(car.id)}
                />
              ))
            ) : (
              <p>No cars available right now.</p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Renter;

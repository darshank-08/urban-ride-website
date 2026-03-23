import styles from "./Signup.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [userType, setUserType] = useState("Renter");
  console.log("Selected user type:", userType);

  const [data, setData] = useState({
    fullName: "",
    username: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    gender: ""
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && !/^\d*$/.test(value)) return;

    setData({
      ...data,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !data.fullName ||
      !data.username ||
      !data.gender ||
      !data.mobile ||
      !data.password ||
      !data.confirmPassword
    ) {
      setErrorMessage("All fields are required");
      return;
    }

    if (!/^[0-9]{10}$/.test(data.mobile)) {
      setErrorMessage("Mobile number must be 10 digits");
      return;
    }

    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    //Switching between test and production APIs
    const owner = {
      testApi: "http://localhost:8080/sign-up/owner",
      prodAPI: "https://urban-rides.onrender.com/sign-up/owner"
    };

    const renter = {
      testApi: "http://localhost:8080/sign-up/renter",
      prodAPI: "https://urban-rides.onrender.com/sign-up/renter"
    };

    const admin = {
      testApi: "http://localhost:8080/sign-up/admin",
      prodAPI: "https://urban-rides.onrender.com/sign-up/admin"
    };

    if (userType === "Renter") {
      var testAPI = renter.testApi;
      var prodAPI = renter.prodAPI;
    } else if (userType === "Owner") {
      var testAPI = owner.testApi;
      var prodAPI = owner.prodAPI;
    } else {
      var testAPI = admin.testApi;
      var prodAPI = admin.prodAPI;
    }

    console.log(testAPI, prodAPI);

    const payload = {
      fullName: data.fullName.trim(),
      userName: data.username.trim(),
      phoneNumber: Number(data.mobile.trim()),
      password: data.password,
      gender: data.gender
    };


    try {
      const res = await fetch(prodAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMessage(result.message || "Something went wrong");
        return;
      }

      alert("Signup successful. Please login to continue.");
      navigate("/login");
    } catch {
      setErrorMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupWrapper}>

      <div className={styles.signupCard}>
        <h2 className={styles.title}>Create User Account</h2>
        <p className={styles.subtitle}>
          Sign up as a Renter or Owner to use Urban Rides
        </p>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className={styles.input}
            value={data.fullName}
            onChange={handleChange}
          />

          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="userType"
                value="Renter"
                checked={userType === "Renter"}
                onChange={(e) => setUserType(e.target.value)}
              />
              Renter
            </label>

            <label>
              <input
                type="radio"
                name="userType"
                value="Owner"
                checked={userType === "Owner"}
                onChange={(e) => setUserType(e.target.value)}
              />
              Owner
            </label>
          </div>

          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            className={styles.input}
            value={data.mobile}
            onChange={handleChange}
            maxLength="10"
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            className={styles.input}
            value={data.username}
            onChange={handleChange}
          />

          <div className={styles.passwordGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className={styles.input}
              value={data.password}
              onChange={handleChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className={styles.input}
              value={data.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={data.gender === "Male"}
                onChange={handleChange}
              />
              Male
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={data.gender === "Female"}
                onChange={handleChange}
              />
              Female
            </label>
          </div>

          <button
            type="submit"
            className={styles.signupBtn}
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;

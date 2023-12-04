import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Product from "../components/Product";
import { useState, useEffect, useReducer } from "react";
import axios from "axios";
import logger from "use-reducer-logger";
import { Helmet } from "react-helmet-async";
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import Banner1 from '../banners/banner1.jpg'
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import SwiperCore, { Autoplay } from 'swiper'
import { Link } from "react-router-dom";
const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, products: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(logger(reducer), {
    products: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get("/api/products");
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: err.message });
      }
    };
    fetchData();
  }, []);
  SwiperCore.use([Autoplay])
  return (
    <div>
      <Helmet>
        <title>E-Smart</title>
      </Helmet>
      <Swiper
      // install Swiper modules
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={50}
      slidesPerView={1}
      navigation
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log('slide change')}
      //remove style to make featured product come in next line
      // style={{display:"flex",justifyContent:"center",alignItems:"center",flexGrow:"revert"}}
    >
      <SwiperSlide><Link to="/product/iphone%2014%20pro%20max"><img src={Banner1} style={{height:"550px" ,width:"1300px"}} alt=""/></Link></SwiperSlide><br></br>
      <SwiperSlide><Link to="/product/Apple%20Watch%20Ultra"><img src="https://cdn.shopify.com/s/files/1/0471/6039/3896/files/Apple-watch-Ultra-Banner-Destop_857ba619-bb5f-43ca-819b-047950b61aca.png?v=1665808667&width=1400" style={{height:"550px" ,width:"1300px"}} alt=""/></Link></SwiperSlide>
      <SwiperSlide><Link to="/product/Apple%20Watch%20Ultra"><img src="https://cdn.shopify.com/s/files/1/0471/6039/3896/files/Apple-watch-8-Banner-Destop.png?v=1663220288&width=1400" style={{height:"550px" ,width:"1300px"}} alt=""/></Link></SwiperSlide>
      <SwiperSlide><Link to="/product/Apple%20Ipad%20Pro"><img src="https://cdn.shopify.com/s/files/1/0471/6039/3896/files/iPad_Pro_M2_Banner_Desktop.png?v=1667543997&width=1400" style={{height:"550px" ,width:"1300px"}} alt=""/></Link></SwiperSlide>
      <SwiperSlide><Link to="/product/apple%20airpods"><img src="https://ismart.co.in/wp-content/uploads/2022/10/airpods-engraving-banner-202209-new.jpg" style={{height:"550px" ,width:"1300px"}} alt=""/></Link></SwiperSlide>
      ...
    </Swiper>
      <h1>Featured Products</h1>
      <div className="products">
        {loading ? (
          <LoadingBox/>
          ) : error ? (
            <MessageBox/>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );

}
export default HomeScreen;

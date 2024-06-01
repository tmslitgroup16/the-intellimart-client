import React, { useState, useContext, useEffect, useRef } from 'react';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import { Link } from 'react-router-dom';
import { CartContext } from './Cart/CartContext';
import Papa from 'papaparse';
import { storage } from '../firebase.config';
import { ref, getDownloadURL } from "firebase/storage";

const Recommendation2Page = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [diet, setDiet] = useState([]);
    const [imageNames, setImageNames] = useState([]);
    const { cart } = useContext(CartContext);
    const cartItems = Object.values(cart);
    const productIds = cartItems.map(item => item.id);

    useEffect(() => {
        const fetchCategoryNames = async () => {
            try {
                const response = await fetch('/assets/product_details.csv');
                const csvData = await response.text();
                const parsedData = Papa.parse(csvData, { header: true }).data;

                const categoryNames = productIds.map(productId => {
                    const product = parsedData.find(item => item.ProductId === productId);
                    return product ? product.CategoryName.toLowerCase() : null;
                });

                const filteredCategoryNames = categoryNames.filter(name => name !== null);

                const uniqueCategoryNames = [...new Set(filteredCategoryNames)];

                const categoryNameString = uniqueCategoryNames.join(', ');

                await getRecommendations(categoryNameString);

            } catch (error) {
                console.error('Error fetching and processing data:', error);
            }
        }

        fetchCategoryNames();

        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const fetchDishPictures = async () => {
            try {
                const dishPictures = await Promise.all(recommendations.map(async (dishName, index) => {
                    const dishRef = ref(storage, `dishes/${dishName}.jpg`);
                    try {
                        const url = await getDownloadURL(dishRef);
                        return { dishName, url, diet: diet[index] };
                    } catch (error) {
                        console.error(`Error fetching download URL for ${dishName}:`, error);
                        return { dishName, url: null, diet: diet[index] };
                    }
                }));

                setImageNames(dishPictures);
            } catch (error) {
                console.error('Error fetching dish pictures:', error);
            }
        };

        if (recommendations.length > 0 && diet.length > 0) {
            fetchDishPictures();
        }
    }, [recommendations, diet]);

    const getRecommendations = async (categoryNameString) => {
        try {
            console.log(categoryNameString)
            const data = { "ingredients": categoryNameString }
            console.log(typeof (data), data);
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/recommend2`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const data = await response.json();
                setRecommendations(data.recommendations);
                setDiet(data.diet)
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const slides = imageNames.map((item) => ({
        url: item.url,
        name: item.dishName,
        diet: item.diet
    }));

    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    useEffect(() => {
        const resizeHandler = () => {
            if (carouselRef.current) {
                const windowHeight = window.innerHeight;
                carouselRef.current.style.height = `${windowHeight}px`;
            }
        };

        window.addEventListener('resize', resizeHandler);
        resizeHandler();

        return () => {
            window.removeEventListener('resize', resizeHandler);
        };
    }, []);

    return (
        <div className='bg-black text-white h-screen overflow-hidden'>
            <div ref={carouselRef} className='max-w-screen-lg mx-auto py-16 px-5 relative group'>
                <h1 className="text-center mb-8 text-3xl font-bold" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 10px gray-200' }}>
                    Seems like you're looking to cook ...
                </h1>
                {slides.length > 0 && (
                    <Link
                        to={{
                            pathname: `/extra-ingredients/${encodeURIComponent(slides[currentIndex].name)}`,
                            state: { dishIndex: currentIndex },
                        }}
                    >
                        <div
                            style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
                            className=' rounded-2xl bg-center bg-cover duration-1000 relative flex justify-center items-center w-full h-96 md:w-full md:h-full'
                        >
                            <div className='absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-75 text-center'>
                                <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "'Dancing Script', cursive", textShadow: '0 0 2px yellow', margin: '0' }}>
                                    {slides[currentIndex].name}
                                </h2>
                                <p className="text-white text-lg" style={{ fontFamily: "'Dancing Script', cursive", textShadow: '0 0 2px yellow', margin: '0' }}>
                                    [{slides[currentIndex].diet}]
                                </p>
                            </div>
                        </div>
                    </Link>
                )}
               <div className=' group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
                    <BsChevronCompactLeft onClick={prevSlide} size={30} className="text-white cursor-pointer" />
                </div>
                <div className=' group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
                    <BsChevronCompactRight onClick={nextSlide} size={30} className="text-white cursor-pointer" />
                </div>
                <div className='flex justify-center mt-4 z-20'>
                    {slides.map((slide, slideIndex) => (
                        <div
                            key={slideIndex}
                            className={`text-2xl cursor-pointer ${slideIndex === currentIndex ? 'text-white' : 'text-gray-500'}`}
                            onClick={() => goToSlide(slideIndex)}
                        >
                            <RxDotFilled />
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 pb-4">
                <Link
                    to="/cart"
                    className="text-center text-white px-6 py-2 bg-black rounded-full"
                    style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.5rem', textShadow: '0 0 5px yellow' }}
                >
                    {'<<'} Go Back
                </Link>
            </div>
            <div className="fixed bottom-0 right-0 pb-4">
                <Link
                    to="/payment"
                    className="text-center text-white px-6 py-2 bg-black rounded-full"
                    style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.5rem', textShadow: '0 0 5px yellow' }}
                >
                    Skip {'>>'}
                </Link>
            </div>
        </div>
    );

}

export default Recommendation2Page;

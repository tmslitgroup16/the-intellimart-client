import React, { useState, useContext, useEffect } from 'react';
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

    return (
        <div className='bg-black text-white '>
            <div className='max-w-[1200px] h-[729px] w-full m-auto py-16 px-5 relative group'>
                <div>
                    <h1 className="flex flex-col justify-center items-center mt-4 sm:mt-0 sm:text-4xl md:text-4xl lg:text-4xl" style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                        Seems like you're looking to cook ...
                    </h1>
                </div>
                {slides.length > 0 && (
                    <Link
                        to={{
                            pathname: `/extra-ingredients/${encodeURIComponent(slides[currentIndex].name)}`,
                            state: { dishIndex: currentIndex },
                        }}
                    >
                        <div
                            style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
                            className='rounded-2xl bg-center bg-cover duration-1000 relative w-full h-96 md:w-full md:h-full'
                        >
                            <div className='absolute bottom-0 text-center w-full text-bold text-white bg-black bg-opacity-45 duration-1000 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl' style={{ fontFamily: "'Dancing Script', cursive", textShadow: '0 0 2px yellow' }}>
                                {slides[currentIndex].name} [{slides[currentIndex].diet}]
                            </div>
                        </div>
                    </Link>
                )}
                {/* Left Arrow */}
                <div className=' group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
                    <BsChevronCompactLeft onClick={prevSlide} size={30} />
                </div>
                {/* Right Arrow */}
                <div className=' group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer'>
                    <BsChevronCompactRight onClick={nextSlide} size={30} />
                </div>

                <div className='flex top-4 justify-center'>

                    {slides.map((slide, slideIndex) => (
                        <div
                            key={slideIndex}
                            onClick={() => goToSlide(slideIndex)}
                            className='text-2xl cursor-pointer'
                        >
                            <RxDotFilled />
                        </div>
                    ))}
                </div>

            </div>
            <Link
                to="/payment"
                className="fixed text-center bottom-16 right-12 md:bottom-10  md:right-12 text-white px-22 py-2 rounded text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                style={{ fontFamily: "'Dancing Script', cursive", textShadow: '0 0 10px yellow' }}
            >
                Skip {'>>'}
            </Link>
            <Link
                to="/cart"
                className="fixed text-center bottom-16 left-12 md:bottom-10 md:left-12  text-white px-22 py-2 rounded text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
                style={{ fontFamily: "'Dancing Script', cursive", textShadow: '0 0 10px yellow' }}
            >
                {'<<'} Go Back
            </Link>


        </div>
    );
}

export default Recommendation2Page;

import React, { useState, useEffect, useRef } from 'react';
import { BsChevronCompactLeft, BsChevronCompactRight } from 'react-icons/bs';
import { RxDotFilled } from 'react-icons/rx';
import { Link } from 'react-router-dom';
import { storage, auth, db } from '../firebase.config';
import { ref, getDownloadURL } from "firebase/storage";
import { collection, doc, getDocs, limit, orderBy, query } from 'firebase/firestore';

const Recommendation1Page = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [diet, setDiet] = useState([]);
    const [imageNames, setImageNames] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        const uid = auth.currentUser.uid;
        const fetchLastUserPurchase = async () => {
            try {
                const purchasesRef = collection(doc(db, 'purchaseHistory', uid), 'purchases');
                const q = query(purchasesRef, orderBy("purchaseDate", "desc"), limit(1));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    console.log("No purchase history found for the user.");
                    await getRecommendations("");
                } else {
                    const lastPurchaseDoc = querySnapshot.docs[0];
                    const lastPurchaseData = lastPurchaseDoc.data();
                    const uniqueCategories = [...new Set(lastPurchaseData.categoryName)];
                    const categoriesString = uniqueCategories.join(', ').toLowerCase();
                    await getRecommendations(categoriesString);
                }
            } catch (error) {
                console.error("Error fetching purchase history:", error);
            }
        }

        fetchLastUserPurchase();
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
            const data = { "ingredients": categoryNameString }
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
                setDiet(data.diet);
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
                    Today's Dish Recommendations for You
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
                <div className='absolute top-1/2 transform -translate-y-1/2 left-0 z-10'>
                    <BsChevronCompactLeft onClick={prevSlide} size={30} className="text-white cursor-pointer" />
                </div>
                <div className='absolute top-1/2 transform -translate-y-1/2 right-0 z-10'>
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
            <div className="fixed bottom-0 right-0 pb-4">  {/* Position "Skip" button at bottom right */}
                <Link
                    to="/"
                    className="text-center text-white px-6 py-2 bg-black rounded-full"
                    style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.5rem', textShadow: '0 0 5px yellow' }}
                >
                    Skip {'>>'}
                </Link>
            </div>
        </div>
    );
}

export default Recommendation1Page;

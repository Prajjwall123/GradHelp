import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import illustration from "../../assets/illustration.png";

// ------------------------------------------------------
// Utility data & helpers
// ------------------------------------------------------

// Very lightweight static data – in a real-world app this could come from an API
const countries = {
    USA: {
        cities: [
            { name: "New York", dorm: 900, apartment: 1500 },
            { name: "Los Angeles", dorm: 850, apartment: 1300 },
            { name: "Chicago", dorm: 800, apartment: 1200 }
        ]
    },
    Canada: {
        cities: [
            { name: "Toronto", dorm: 700, apartment: 1100 },
            { name: "Vancouver", dorm: 750, apartment: 1200 },
            { name: "Montreal", dorm: 600, apartment: 950 }
        ]
    },
    Australia: {
        cities: [
            { name: "Sydney", dorm: 800, apartment: 1400 },
            { name: "Melbourne", dorm: 750, apartment: 1300 },
            { name: "Brisbane", dorm: 650, apartment: 1000 }
        ]
    }
};

// Numerical multipliers for scales 1-5. You can tweak these numbers for realism.
const SCALE_COST = {
    1: 50,
    2: 100,
    3: 150,
    4: 200,
    5: 250
};

// Daily life cost presets
const TRANSPORT_COST = {
    Never: 0,
    "Few times / month": 30,
    Weekly: 60,
    Daily: 120
};

export default function CostOfLivingCalculator() {
    // --------------------------------------------------
    // State
    // --------------------------------------------------
    const [step, setStep] = useState(0);

    // Housing selections
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [accommodation, setAccommodation] = useState(""); // dorm | apartment

    // Fooding
    const [eatOutFreq, setEatOutFreq] = useState(null); // 1-5
    const [foodSpend, setFoodSpend] = useState(null);   // 1-5

    // Clothing
    const [clothingItems, setClothingItems] = useState(null); // 1-5
    const [clothingSpend, setClothingSpend] = useState(null); // 1-5

    // Daily life
    const [transportFreq, setTransportFreq] = useState("Never");
    const [internetCost, setInternetCost] = useState(50); // numeric input

    // --------------------------------------------------
    // Derived calculations
    // --------------------------------------------------
    const selectedCityData = (() => {
        if (!country || !city) return null;
        return countries[country].cities.find(c => c.name === city);
    })();

    const housingCost = selectedCityData ? selectedCityData[accommodation || "dorm"] || 0 : 0;
    const foodingCost = (SCALE_COST[eatOutFreq] || 0) + (SCALE_COST[foodSpend] || 0);
    const clothingCost = (SCALE_COST[clothingItems] || 0) + (SCALE_COST[clothingSpend] || 0);
    const dailyLifeCost = (TRANSPORT_COST[transportFreq] || 0) + Number(internetCost || 0);

    const total = housingCost + foodingCost + clothingCost + dailyLifeCost;

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------
    const next = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
    const prev = () => setStep(prev => Math.max(prev - 1, 0));

    const steps = [
        "Housing",
        "Fooding",
        "Clothing",
        "Daily Life",
        "Result"
    ];

    // Basic form validation for the Next button
    const canProceed = () => {
        switch (step) {
            case 0:
                return country && city && accommodation;
            case 1:
                return eatOutFreq && foodSpend;
            case 2:
                return clothingItems && clothingSpend;
            case 3:
                return transportFreq && internetCost >= 0;
            default:
                return true;
        }
    };

    // --------------------------------------------------
    // UI components
    // --------------------------------------------------

    // Accent color for consistency
    const accent = "bg-blue-600 text-white";

    // Section card, matching dashboard style
    const Section = ({ children, title }) => (
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 w-full max-w-4xl mx-auto p-8 mb-8">
            {title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            )}
            {children}
        </div>
    );

    // Stepper, matching dashboard style
    const Stepper = () => (
        <div className="flex items-center justify-center my-8 gap-4 select-none">
            {steps.map((label, index) => (
                <React.Fragment key={label}>
                    <div className="flex items-center flex-col gap-1">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-colors
                                ${index === step ? "bg-blue-600 text-white shadow-lg" : index < step ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        >
                            {index < step ? <Check size={18} /> : index + 1}
                        </div>
                        <span className="hidden sm:block text-xs font-semibold text-gray-700 mt-1">{label}</span>
                    </div>
                    {index !== steps.length - 1 && (
                        <div className="hidden sm:block w-12 h-1 bg-gray-300 rounded" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // Button styles
    const buttonBase = "inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors";
    const buttonPrimary = `${buttonBase} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50`;
    const buttonSecondary = `${buttonBase} bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50`;

    // Scale 1-5 picker rendered as checkbox-style radios
    const ScaleSelector = ({ value, onChange, label }) => (
        <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map(n => (
                    <label key={n} className="flex flex-col items-center cursor-pointer">
                        <input
                            type="radio"
                            name={label}
                            value={n}
                            checked={value === n}
                            onChange={() => onChange(n)}
                            className="form-checkbox h-5 w-5 text-blue-600 mb-1"
                        />
                        <span className="text-sm">{n}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    // Country selector with modern styling
    const CountrySelector = ({ value, onChange, label }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
            >
                <option value="">Select a country</option>
                {Object.keys(countries).map((country) => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </select>
        </div>
    );

    // City selector with modern styling
    const CitySelector = ({ value, onChange, label, country }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select
                value={value}
                onChange={onChange}
                disabled={!country}
                className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
                <option value="">Select a city</option>
                {country && countries[country]?.cities.map((city) => (
                    <option key={city.name} value={city.name}>
                        {city.name}
                    </option>
                ))}
            </select>
        </div>
    );

    // Accommodation selector
    const AccommodationSelector = ({ value, onChange, label }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
            >
                <option value="">Select accommodation type</option>
                <option value="dorm">Dormitory</option>
                <option value="apartment">Apartment</option>
            </select>
        </div>
    );

    // Transport frequency selector
    const TransportFrequency = ({ value, onChange, label }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <select
                value={value}
                onChange={onChange}
                className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
            >
                {Object.entries(TRANSPORT_COST).map(([key, value]) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </select>
        </div>
    );

    // Internet cost input
    const InternetCostInput = ({ value, onChange, label }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={onChange}
                    className="w-full pl-3 pr-10 py-2.5 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                    placeholder="Enter monthly cost"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            </div>
        </div>
    );

    // Result display
    const ResultDisplay = () => (
        <Section title="Cost of Living Summary">
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Monthly Cost</h3>
                    <p className="text-3xl font-bold text-blue-600">${total.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Housing Cost</h4>
                        <p className="text-lg font-semibold">${housingCost.toLocaleString()}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Fooding Cost</h4>
                        <p className="text-lg font-semibold">${foodingCost.toLocaleString()}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Clothing Cost</h4>
                        <p className="text-lg font-semibold">${clothingCost.toLocaleString()}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">Daily Life Cost</h4>
                        <p className="text-lg font-semibold">${dailyLifeCost.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </Section>
    );

    // Cost Breakdown component
    const CostBreakdown = () => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-900">Cost Breakdown</h3>
                <div className="space-y-4">
                    {[
                        { label: "Housing", value: housingCost },
                        { label: "Fooding", value: foodingCost },
                        { label: "Clothing", value: clothingCost },
                        { label: "Daily Life", value: dailyLifeCost }
                    ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-medium">${item.value.toFixed(0)}</span>
                        </div>
                    ))}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-semibold">Total Monthly Cost</span>
                            <span className="text-xl font-bold">${total.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // --------------------------------------------------
    // Render per-step content
    // --------------------------------------------------

    const renderStepContent = () => {
        switch (step) {
            case 0: // Housing
                return (
                    <Section title="Housing">
                        <div className="space-y-6">
                            <CountrySelector value={country} onChange={e => setCountry(e.target.value)} label="Select a country" />
                            <CitySelector value={city} onChange={e => setCity(e.target.value)} label="Select a city" country={country} />
                            <AccommodationSelector value={accommodation} onChange={e => setAccommodation(e.target.value)} label="Select accommodation type" />
                        </div>
                    </Section>
                );
            case 1: // Fooding
                return (
                    <Section title="Fooding">
                        <div className="space-y-6">
                            <ScaleSelector value={eatOutFreq} onChange={setEatOutFreq} label="How often do you eat out?" />
                            <ScaleSelector value={foodSpend} onChange={setFoodSpend} label="How much do you spend on food?" />
                        </div>
                    </Section>
                );
            case 2: // Clothing
                return (
                    <Section title="Clothing">
                        <div className="space-y-6">
                            <ScaleSelector value={clothingItems} onChange={setClothingItems} label="How many items of clothing do you buy each month?" />
                            <ScaleSelector value={clothingSpend} onChange={setClothingSpend} label="How much do you spend on those purchases?" />
                        </div>
                    </Section>
                );
            case 3: // Daily Life
                return (
                    <Section title="Daily Life">
                        <div className="space-y-6">
                            <TransportFrequency value={transportFreq} onChange={e => setTransportFreq(e.target.value)} label="How often will you use public transport?" />
                            <InternetCostInput value={internetCost} onChange={e => setInternetCost(e.target.value)} label="How much do you spend on internet and phone plan?" />
                        </div>
                    </Section>
                );
            case 4: // Result
                return (
                    <ResultDisplay />
                );
            default:
                return null;
        }
    };

    // --------------------------------------------------
    // Main render
    // --------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row gap-8 mb-12">
                        {/* Left - Header and Illustration */}
                        <div className="md:w-1/2">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-8">
                                <img
                                    src={illustration}
                                    alt="Cost of Living Calculator"
                                    className="w-64 h-auto mb-6"
                                />
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Cost of Living Calculator</h1>
                                    <p className="text-gray-500">Calculate your estimated monthly expenses for studying abroad</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <CostBreakdown />
                            </div>
                        </div>

                        {/* Right - Content */}
                        <div className="md:w-1/2">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col h-full">
                                <div className="flex-1">
                                    <Stepper />
                                    {renderStepContent()}
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <button
                                        onClick={prev}
                                        className={`${buttonSecondary} ${step === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={step === 0}
                                    >
                                        <ArrowLeft size={20} />
                                        Previous
                                    </button>
                                    <button
                                        onClick={next}
                                        className={`${buttonPrimary} ${!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={!canProceed()}
                                    >
                                        {step === steps.length - 1 ? 'Finish' : 'Next'}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
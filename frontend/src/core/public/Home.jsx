import React from "react";
import Navbar from "../../components/Navbar";
import SearchBar from "../../components/SearchBar";
import heroImg from "../../assets/graduation-hero.png";
import whiteLogo from "../../assets/white_logo.png";
import { GraduationCap, DollarSign, PenTool, BookOpen } from "lucide-react";

const features = [
    {
        icon: <GraduationCap size={40} className="mx-auto mb-3" />,
        title: "Find Universities",
        desc: "Discover top global universities tailored to your academic goals.",
    },
    {
        icon: <DollarSign size={40} className="mx-auto mb-3" />,
        title: "Get Scholarships",
        desc: "Access a wide range of scholarship opportunities easily.",
    },
    {
        icon: <PenTool size={40} className="mx-auto mb-3" />,
        title: "Write SOPs",
        desc: "Craft compelling Statements of Purpose with expert guidance.",
    },
    {
        icon: <BookOpen size={40} className="mx-auto mb-3" />,
        title: "Find Programs",
        desc: "Explore the best programs that suit your future ambitions.",
    },
];

const Home = () => (
    <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-[90rem] mx-auto px-6">
            {/* Hero Section */}
            <section className="flex flex-col md:flex-row items-center justify-between gap-14 pt-8 pb-12">
                <div className="flex-1 pr-4">
                    <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-[#05213b]">
                        Your Global Future<br />Starts Here
                    </h1>
                    <p className="mb-8 text-lg text-gray-700 max-w-2xl">
                        Explore top universities, find the best courses, secure scholarships,
                        and get guidance on applications, SOPs, and visas — all in one smart platform.
                    </p>
                    <button className="bg-[#05213b] text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-[#1a3450] transition duration-200">
                        Start Browsing
                    </button>
                </div>
                <div className="flex-1 flex justify-center">
                    <img src={heroImg} alt="Graduation" className="w-full max-w-lg rounded-2xl shadow-xl" />
                </div>
            </section>
            
            {/* Search Bar Section */}
            <div className="relative z-10 -mt-16 mb-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#05213b] mb-6 text-center">Find Your Dream University</h2>
                        <SearchBar />
                    </div>
                </div>
            </div>



            {/* Features */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
                {features.map((feature, i) => (
                    <div key={i} className="bg-[#f6f8fa] rounded-2xl p-8 flex flex-col items-center text-center shadow-md hover:shadow-lg transition">
                        <div className="text-[#05213b]">{feature.icon}</div>
                        <h3 className="font-semibold text-xl mt-2 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </div>
                ))}
            </section>
        </main>
        {/* About Section */}
        <section id="about" className="mt-24 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#05213b]">Why Choose Gradly?</h2>
            <p className="text-gray-600 text-lg mb-6">
                Gradly is your all-in-one platform for global education. We simplify your journey from researching universities to securing scholarships and preparing perfect applications. Our AI-powered assistant and expert resources ensure you achieve your academic dreams.
            </p>
            <div className="flex flex-col md:flex-row gap-8 justify-center mt-8">
                <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
                    <h3 className="font-semibold text-xl mb-2 text-[#05213b]">Personalized Guidance</h3>
                    <p className="text-gray-500">Get tailored recommendations for universities, programs, and scholarships based on your profile.</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
                    <h3 className="font-semibold text-xl mb-2 text-[#05213b]">AI Assistant</h3>
                    <p className="text-gray-500">Use our AI assistant to answer your questions, review your SOPs, and help you through every step.</p>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="mt-28 max-w-6xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#05213b]">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
                <div className="bg-[#f6f8fa] rounded-xl p-8 shadow flex flex-col items-center">
                    <span className="bg-[#05213b] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</span>
                    <h4 className="font-semibold text-lg mb-2">Browse & Compare</h4>
                    <p className="text-gray-600">Explore universities, courses, and scholarships worldwide. Filter and compare easily.</p>
                </div>
                <div className="bg-[#f6f8fa] rounded-xl p-8 shadow flex flex-col items-center">
                    <span className="bg-[#05213b] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</span>
                    <h4 className="font-semibold text-lg mb-2">Apply Effortlessly</h4>
                    <p className="text-gray-600">Submit applications, upload documents, and track your progress all in one place.</p>
                </div>
                <div className="bg-[#f6f8fa] rounded-xl p-8 shadow flex flex-col items-center">
                    <span className="bg-[#05213b] text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</span>
                    <h4 className="font-semibold text-lg mb-2">Succeed Globally</h4>
                    <p className="text-gray-600">Get guidance on visas, accommodation, and settling in. Start your global journey with confidence!</p>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="mt-28 max-w-6xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-[#05213b]">What Students Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Student" className="w-16 h-16 rounded-full mb-3" />
                    <p className="text-gray-700 italic mb-2">“Gradly made my university search so easy. I got my scholarship and admission without any hassle!”</p>
                    <span className="font-semibold text-[#05213b]">Rohan S.</span>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Student" className="w-16 h-16 rounded-full mb-3" />
                    <p className="text-gray-700 italic mb-2">“The AI Assistant helped me write a winning SOP and answered all my questions instantly.”</p>
                    <span className="font-semibold text-[#05213b]">Priya M.</span>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <img src="https://randomuser.me/api/portraits/men/54.jpg" alt="Student" className="w-16 h-16 rounded-full mb-3" />
                    <p className="text-gray-700 italic mb-2">“Best platform for international students. Everything I needed was in one place!”</p>
                    <span className="font-semibold text-[#05213b]">Alex T.</span>
                </div>
            </div>
        </section>

        {/* Call to Action Section */}
        <section className="mt-28 max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-[#05213b] to-[#1a3450] rounded-2xl shadow-xl p-12 flex flex-col items-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Ready to Start Your Global Journey?</h2>
                <p className="text-gray-200 text-lg mb-6">Join thousands of students who’ve found their dream universities with Gradly. Sign up now and unlock a world of opportunities!</p>
                <a href="#get-started" className="bg-[#ffd700] text-[#05213b] px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-yellow-400 transition">Get Started</a>
            </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 bg-[#05213b] text-white py-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-8">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <img src={whiteLogo} alt="Gradly Logo" className="w-10 h-10" />
                    <span className="text-xl font-bold">GRADLY</span>
                </div>
                <ul className="flex gap-8 text-base font-medium mb-4 md:mb-0">
                    <li><a href="#about" className="hover:underline">About us</a></li>
                    <li><a href="#universities" className="hover:underline">Universities</a></li>
                    <li><a href="#courses" className="hover:underline">Courses</a></li>
                    <li><a href="#ai-assistant" className="hover:underline">AI Assistant</a></li>
                </ul>
                <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Gradly. All rights reserved.</p>
            </div>
        </footer>
    </div>
);

export default Home;


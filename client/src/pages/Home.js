import React from 'react';
import { Link } from 'react-router-dom';


const HomePage = () => {
  return (
    <div className="container mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 bg-gradient-to-r from-blue-500 to-green-500 text-white">
        <h1 className="text-5xl font-bold mb-6">Welcome to Expense Tracker</h1>
        <p className="text-xl mb-8">
          The ultimate tool for managing your personal finances.
        </p>
        <Link to="/register" className="bg-white hover:bg-gray-100 text-blue-700 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
          Get Started
        </Link>
      </div>

      {/* Features Overview */}
      <div className="py-16">
        <h2 className="text-3xl text-center font-bold mb-12">Why Expense Tracker?</h2>
        <div className="flex justify-around flex-wrap">
          <div className="max-w-sm">
            <div className="text-center mb-4 opacity-75">
              <img src="/icons/chart.svg" alt="Insights" className="w-16 h-16 mx-auto"/>
            </div>
            <p>Visualize spending with beautiful charts and insights.</p>
          </div>
          <div className="max-w-sm">
            <div className="text-center mb-4 opacity-75">
              <img src="/icons/group.svg" alt="Groups" className="w-16 h-16 mx-auto"/>
            </div>
            <p>Manage group expenses easily with friends and family.</p>
          </div>
          <div className="max-w-sm">
            <div className="text-center mb-4 opacity-75">
              <img src="/icons/mobile.svg" alt="On-the-go" className="w-16 h-16 mx-auto"/>
            </div>
            <p>Access your expenses anywhere, anytime.</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-100 py-16">
        <h2 className="text-3xl text-center font-bold mb-12">What Users Are Saying</h2>
        <div className="flex justify-center gap-8">
          <blockquote className="bg-white p-4 rounded shadow-lg">
            <p>"Expense Tracker has changed the way I manage my finances. It's simple and effective."</p>
            <footer className="text-right">- Jane Doe</footer>
          </blockquote>
          <blockquote className="bg-white p-4 rounded shadow-lg">
            <p>"The group expenses feature is a game-changer for splitting bills. Love it!"</p>
            <footer className="text-right">- John Doe</footer>
          </blockquote>
        </div>
      </div>

      {/* Footer */}
      <div>
      <footer className="bg-gray-800 text-white text-center p-4 mt-16">
        Expense Tracker © 2024. All Rights Reserved.
      </footer>
      </div>
    </div>
  );
};

export default HomePage;
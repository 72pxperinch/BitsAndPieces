import React from "react";

export default function Navbar({
  isAuthenticated,
  isLogin,
  onToggleForm,
  onMenuClick,
  handleLogout,
}) {
  return (
    <div className="w-full flex justify-between items-center py-6 px-12 border-b border-gray-300">
      <div
        className="flex items-center space-x-2"
        onClick={(e) => {
          e.preventDefault();
          onMenuClick();
        }}
      >
        <img
          src="/assets/logo.png"
          alt="Logo"
          className="h-8 w-8 rounded-[2px]"
        />
        <span className="text-xl font-semibold text-gray-800">
          Bits and Pieces
        </span>
      </div>

      <a
        onClick={(e) => {
          e.preventDefault();
          isAuthenticated ? handleLogout() : onToggleForm();
        }}
        className={`${
          isAuthenticated ? "text-red-700" : "text-teal-700"
        } font-medium hover:font-black transition-all duration-300 cursor-pointer`}
      >
        {isAuthenticated ? (
          <img
            src="/icons/logout.png"
            alt="Logout"
            className="h-8 w-8  md:hidden"
          />
        ) : (
          ""
        )}
      </a>
      <a
        onClick={(e) => {
          e.preventDefault();
          isAuthenticated ? handleLogout() : onToggleForm();
        }}
        className={`${
          isAuthenticated ? "text-red-700" : "text-teal-700"
        } font-medium hover:font-black transition-all duration-300 cursor-pointer max-md:hidden`}
      >
        {isAuthenticated ? "Logout" : isLogin ? "Sign Up" : "Login"}
      </a>
    </div>
  );
}

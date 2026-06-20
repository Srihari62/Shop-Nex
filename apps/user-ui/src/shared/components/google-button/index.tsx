import toast from "react-hot-toast";

export default function GoogleButton() {
  const handleClick = () => {
    toast.error("Google Sign-in is not implemented yet. Please use email and password to log in.");
  };

  return (
    <div className="w-full flex justify-center">
      <div
        onClick={handleClick}
        className="
        inline-flex items-center gap-3 px-4 py-2
        border border-gray-300 bg-gray-100 
        rounded-[4px] shadow-sm
        text-gray-600 text-md 
        hover:shadow-md transition-all cursor-pointer
        select-none 
      "
      >
        {/* Google Icon */}
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 533.5 544.3"
        >
          <path
            fill="#4285F4"
            d="M533.5 278.4c0-18.7-1.6-37-4.7-54.6H272v103.4h146.9c-6.3 
          34-25.2 62.9-53.9 82.1v68.1h87.1c51-47 80.4-116.2 80.4-198.9z"
          />
          <path
            fill="#34A853"
            d="M272 544.3c73.7 0 135.6-24.5 180.8-66.6l-87.1-68.1c-24.2 
          16.3-55.3 25.9-93.7 25.9-72.0 0-133.0-48.6-154.8-114.3H28.1v71.8C73.0 
          486.2 167.6 544.3 272 544.3z"
          />
          <path
            fill="#FBBC05"
            d="M117.2 323.2c-5.4-16.3-8.5-33.8-8.5-51.6s3.1-35.3 8.5-51.6V148.2H28.1
          C10.2 187 0 227.8 0 272s10.2 85 28.1 123.8l89.1-72.6z"
          />
          <path
            fill="#EA4335"
            d="M272 107.7c39.9 0 75.8 13.7 104.1 40.7l78.1-78.1C407.4 29.0 
          345.5 0 272 0 167.6 0 73 58.1 28.1 148.2l89.1 71.4C139 
          156.4 200 107.7 272 107.7z"
          />
        </svg>

        <span className="font-Poppins opacity-[.8] text-[16px]">
          Sign in with Google
        </span>
      </div>
    </div>
  );
}


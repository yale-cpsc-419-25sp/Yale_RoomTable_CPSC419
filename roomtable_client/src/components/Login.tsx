import React from 'react';

const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:8000/login';
    };

    return (
        <div className="flex justify-center">
            <button onClick={handleLogin} class="bg-blue-500 hover:bg-blue-400 transition-colors duration-300 text-white font-normal py-2 px-4 rounded">
                Log in with Yale CAS
            </button>
        </div>
    );
};

export default LoginButton;
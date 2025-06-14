// Login button component (for CAS authentication on the landing page)
const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:8000/api/login';
    };

    return (
        <div className="flex justify-center">
            <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-400 transition-colors duration-300 text-white font-normal py-2 px-4 rounded">
                Log in with Yale CAS
            </button>
        </div>
    );
};

export default LoginButton;
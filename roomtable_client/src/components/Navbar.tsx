import UserDropdown from './Dropdown';
// import Search from '../pages/Search'

const Navbar = ({ user }) => {
    return (
        <div className='flex justify-between items-center h-24 w-full mx-auto px-6'>
            <div className="flex items-center space-x-2">
                <a href='/search'>
                    <img
                        src="/floorplans/logowithoutroomtable.jpg"
                        alt="RoomTable Logo"
                        className="h-16 w-12 object-contain -mt-2"
                    />
                </a>
                <h1 className="text-3xl font-bold">
                    <a href='/search'>RoomTable</a>
                </h1>
                
                
            </div>
            <div className="flex items-center space-x-4">
            {!user ? (
                <>
                <a href="http://localhost:8000/api/login" className="p-4">
                    Login
                </a>
                <span className="p-4">About</span>
                </>
            ) : (
                <>
                <a href="/timeline" className="p-4">
                    Timeline
                </a>
                <div className="p-4">
                    <UserDropdown />
                </div>
                </>
            )}
            </div>

            
        </div>
    )
}

export default Navbar;
import React from 'react';
import UserDropdown from './Dropdown';

const Navbar = ({ user }) => {
    return (
        <div className='flex justify-between items-center h-24 max-w-[1240px] mx-auto px-4'>
            <h1 className='w-full text-3xl font-bold'>RoomTable</h1>
            <ul className='flex'>
                {!user ? (
                    <>
                        <li className='p-4'>
                            <a href="http://localhost:8000/api/login">
                                Login
                            </a>
                        </li>
                        <li className='p-4'>About</li>
                    </>
                    ) : (
                    <>
                        <UserDropdown />
                    </>
                )}  
            </ul>
        </div>
    )
}

export default Navbar;
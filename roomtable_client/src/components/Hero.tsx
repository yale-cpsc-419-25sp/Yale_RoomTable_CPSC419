import { ReactTyped } from 'react-typed';
import LoginButton from './LoginButton';

// Rotating text component on the landing page
const Hero = () => {
    return (
        <div className='max-w-[800px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
            <h1 className='md:text-7xl sm:text-6xl text-4xl font-bold md:py-6'>Housing made easy.</h1>
            <div className='flex justify-center items-center'>
                <p className='md:text-5xl sm:text-4xl text-xl font-normal'>I'm looking for</p>
                <ReactTyped className='md:text-5xl sm:text-4xl text-xl font-bold md:pl-4 pl-2'
                    strings={['suites', 'reviews', 'roommates']} 
                    typeSpeed={120}
                    backSpeed={45}
                    loop
                />
            </div>
            <div className='mt-6 text-s'>
                <LoginButton />
            </div>
        </div>
    )
}

export default Hero
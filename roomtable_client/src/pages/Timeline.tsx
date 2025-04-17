// import { useEffect, useState } from "react";

function Timeline() {
    return (
        <div className="max-w-7xl mx-auto flex flex-col items-center pt-8">
            <iframe
            src="https://calendar.google.com/calendar/embed?src=c_3937aed80493a94b2e602e4bca47d7c568981992a42971cae49974cb2ede8c0f%40group.calendar.google.com&ctz=America%2FNew_York"
            style={{ border: 0 }}
            width="800"
            height="600"
            frameBorder="0"
            scrolling="no"
            />            
        </div>
    );
};

export default Timeline;
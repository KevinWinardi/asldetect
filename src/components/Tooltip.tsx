import React, { useState } from "react";

export function Tooltip({
    text = "",
    html = null,
}: {
    text?: string;
    html?: React.ReactNode;
}) {
    const [isShow, setIsShow] = useState(false);

    return (
        <button
            onClick={() => setIsShow(!isShow)}
            className="relative flex justify-center items-center ml-4 cursor-pointer transition-opacity duration-500">
            <i className="fa-solid fa-circle-info text-xl text-blue-500"></i>

            <div
                className={`
                    ${isShow ? 'opacity-100 visible' : 'opacity-0 invisible'}
                    absolute bottom-full right-0 overflow-y-auto
                    z-50 w-max max-w-[70vw] sm:max-w-xs max-h-[200px]
                    p-3 text-sm text-white bg-black rounded-sm shadow-lg
                    transition-all duration-500
                `}
            >
                {html ? html : <p>{text}</p>}
            </div>
        </button>
    );
}

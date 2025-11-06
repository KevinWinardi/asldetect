import React from "react";

export function Tooltip({
    text = "",
    html = null,
}: {
    text?: string;
    html?: React.ReactNode;
}) {
    return (
        <div className="relative flex justify-center items-center ml-4 group">
            <i className="fa-solid fa-circle-info text-xl text-blue-500"></i>

            <div
                className="
                    absolute bottom-full right-0 overflow-y-auto
                    z-50 w-max max-w-[70vw] sm:max-w-xs max-h-[200px]
                    p-3 text-sm text-white bg-black rounded-sm shadow-lg
                    opacity-0 invisible transition-all duration-300
                    group-hover:opacity-100 group-hover:visible
                "
            >
                {html ? html : <p>{text}</p>}
            </div>
        </div>
    );
}

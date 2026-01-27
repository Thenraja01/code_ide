import { Button } from "@/components/ui/button";


export default function Home() {
    return (
        <>
            <div className="flex text-start p-2">

                <div className=" gap-12 border-dotted p-2 ">
                    <h1 className="text-5xl text-bold text-start font-mono space-x-1">code sp<span className="bg-linear-to-b from-red-700 black to-gray-600 uppercase text-transparent bg-clip-text font-serif text-6xl">a</span>ce<span className="animate-caret-blink text-lg font-semibold">_</span></h1>
                    <p className="sm:w-80% py-2 my-3 text-3xl text-start font-extralight text-accent-foreground ">The AI powered developer platform to build, scale and integrate with github deliver a software securely</p>
                    <div className="space-x-2 font-serif text-2xl">

                        <Button className="bg-chart-2">login</Button>
                        <Button className="bg-chart-1">explore more</Button>
                    </div>

                </div>
                <div className="p-12">

                </div>
            </div>
           

<ol className="relative border-s border-default m-12 p-12"> 
 
                 
    <li className="mb-10 ms-4">
        <div className="absolute w-3 h-3 bg-neutral-quaternary hover:bg-red-500 rounded-full mt-1.5 -start-1.5 border border-buffer"></div>
        <time className="text-sm font-normal leading-none text-body"> What is CodeSpace?</time>
        <h3 className="text-lg font-semibold text-heading my-2">- Supports multiple programming languages
    - Cloud-based coding platform
- No local setup required </h3>
        <p className="mb-4 text-base font-normal text-body">Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Marketing pages.</p>
        <a href="#" className="inline-flex items-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            Learn more
            <svg className="w-4 h-4 ms-1.5 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg>
        </a>
    </li>
    <li className="mb-10 ms-4">
        <div className="absolute w-3 h-3 animate-color-pulse rounded-full mt-1.5 -start-1.5 border border-buffer"></div>
        <time className="text-sm font-normal leading-none text-body">March 2022</time>
        <h3 className="text-lg font-semibold text-heading my-2">Marketing UI design in Figma</h3>
        <p className="text-base font-normal text-body">All of the pages and components are first designed in Figma and we keep a parity between the two versions even as we update the project.</p>
    </li>
    <li className="ms-4">
        <div className="absolute w-3 h-3 bg-neutral-quaternary  hover:bg-red-900 rounded-full mt-1.5 -start-1.5 border border-buffer"></div>
        <time className="mb-1 text-sm font-normal leading-none text-body">April 2022</time>
        <h3 className="text-lg font-semibold text-heading my-2">E-Commerce UI code in Tailwind CSS</h3>
        <p className="text-base font-normal text-body">Get started with dozens of web components and interactive elements built on top of Tailwind CSS.</p>
    <div className="animate-color-pulse w-3 h-3 rounded-full"></div>
</li>

</ol>



        </>
    )

};

import React from "react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative py-20 px-6 md:px-12 lg:px-24 bg-muted overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        About Us
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        We are building the future of digital experiences. Passionate, innovative, and dedicated to excellence.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            Our mission is to empower users with intuitive and powerful tools. We believe in simplicity, performance, and accessibility.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Every line of code we write is aimed at making your life easier and your work more productive.
                        </p>
                    </div>
                    <div className="bg-muted rounded-2xl h-64 md:h-80 flex items-center justify-center">
                        <span className="text-muted-foreground font-medium">Mission Image Placeholder</span>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 px-6 md:px-12 lg:px-24 bg-muted">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Meet the Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Team Member 1 */}
                        <div className="bg-background p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-600 font-bold text-xl">
                                JD
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-1">John Doe</h3>
                            <p className="text-blue-600 text-center text-sm mb-4">CEO & Founder</p>
                            <p className="text-muted-foreground text-center text-sm">
                                Visionary leader with 10+ years of experience in tech.
                            </p>
                        </div>

                        {/* Team Member 2 */}
                        <div className="bg-background p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-indigo-600 font-bold text-xl">
                                JS
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-1">Jane Smith</h3>
                            <p className="text-indigo-600 text-center text-sm mb-4">CTO</p>
                            <p className="text-muted-foreground text-center text-sm">
                                Tech enthusiast and architect of our core systems.
                            </p>
                        </div>

                        {/* Team Member 3 */}
                        <div className="bg-background p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-24 h-24 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center text-purple-600 font-bold text-xl">
                                MJ
                            </div>
                            <h3 className="text-xl font-semibold text-center mb-1">Mike Johnson</h3>
                            <p className="text-purple-600 text-center text-sm mb-4">Lead Designer</p>
                            <p className="text-muted-foreground text-center text-sm">
                                Creative mind behind our beautiful user interfaces.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

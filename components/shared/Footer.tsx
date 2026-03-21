import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
    return (
        <footer className="relative bg-gray-950 text-gray-300">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-egyptian-gold/60 to-transparent" />
            <div className="container mx-auto px-4 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-center bg-cover" style={{ backgroundImage: 'url(/logo.png)' }} />
                            <h3 className="text-white font-bold text-xl font-display">Kemet</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed font-light">
                            Your trusted companion for discovering the wonders of Egypt. Plan, explore, and experience the magic of ancient civilization through AI.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/destinations" className="text-sm hover:text-egyptian-gold transition-colors">
                                    Destinations
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm hover:text-egyptian-gold transition-colors">
                                    About Egypt
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-sm hover:text-egyptian-gold transition-colors">
                                    Plan Your Trip
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>info@egyptexplorer.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>+20 2 1234 5678</span>
                            </li>
                            <li className="flex items-center space-x-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>Cairo, Egypt</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Follow Us</h3>
                        <div className="flex space-x-3">
                            <a href="#" className="rounded-xl p-2 hover:bg-white/5 hover:text-egyptian-gold transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="rounded-xl p-2 hover:bg-white/5 hover:text-egyptian-gold transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="rounded-xl p-2 hover:bg-white/5 hover:text-egyptian-gold transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-10 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Kemet Explorer. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, LogOut } from 'lucide-react';

const Header = () => {
    const { userInfo, logout } = useAuth();

    const renderNavLinks = () => {
        if (!userInfo) return null; // No nav links if not logged in, besides the logo

        if (userInfo.role === 'employer') {
            return (
                <>
                    <NavLink to="/employer/dashboard" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        Dashboard
                    </NavLink>
                    {/* Add more employer-specific links here */}
                </>
            );
        }

        if (userInfo.role === 'candidate') {
            return (
                <>
                    <NavLink to="/jobs" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        Browse Jobs
                    </NavLink>
                    <NavLink to="/candidate/dashboard" className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? '' : 'text-muted-foreground'}`}>
                        My Applications
                    </NavLink>
                </>
            );
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/60 dark:bg-background/60 backdrop-blur-lg shadow-lg transition-all duration-500 supports-[backdrop-filter]:bg-background/60">
            <div className="container h-14 flex items-center">
                <Link to="/" className="mr-6 flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 19 8.9 19 7c0-2.2-1.8-4-4-4S11 4.8 11 7c0 1.9 1.3 3.2 2.5 4.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                    <span className="font-bold">IntelliVibe</span>
                </Link>

                <nav className="flex-1 flex items-center space-x-6">
                    {renderNavLinks()}
                </nav>

                <div className="flex items-center justify-end space-x-4">
                    {userInfo ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="rounded-full">
                                    <User className="h-5 w-5" />
                                    <span className="sr-only">Toggle user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to={userInfo.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'}>Dashboard</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={logout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button variant="ghost" asChild>
                                <Link to="/login">Login</Link>
                            </Button>
                            <Button asChild>
                                <Link to="/register">Sign Up</Link>
                            </Button>
                        </>
                    )}
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default Header;
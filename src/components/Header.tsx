import Link from "next/link";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <div className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[300px]"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative" asChild>
                    <Link href="/signup">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 border border-card" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" asChild>
                    <Link href="/login">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-5 w-5" />
                        </div>
                    </Link>
                </Button>
            </div>
        </header>
    );
}

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-card/80 backdrop-blur-xl border border-white/10",
                        headerTitle: "text-white",
                        headerSubtitle: "text-muted-foreground",
                        socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10",
                        formFieldLabel: "text-white",
                        formFieldInput: "bg-white/5 border-white/10 text-white",
                        footerActionLink: "text-primary hover:text-primary/80",
                        identityPreviewEditButton: "text-primary",
                    }
                }}
            />
        </div>
    )
}

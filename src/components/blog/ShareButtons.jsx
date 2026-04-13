import React from 'react';
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Twitter, Mail, Link2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareButtons({ post, url }) {
    const shareUrl = url || window.location.href;
    const text = `${post.title} - ${post.excerpt || ''}`;
    const imageUrl = post.featured_image;

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    const shareToFacebook = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    const shareToLinkedIn = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedInUrl, '_blank', 'width=600,height=400');
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent(post.title);
        const body = encodeURIComponent(`${text}\n\nRead more: ${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    };

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={shareToTwitter}
                className="gap-2"
            >
                <Twitter className="w-4 h-4" />
                Twitter
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={shareToFacebook}
                className="gap-2"
            >
                <Facebook className="w-4 h-4" />
                Facebook
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={shareToLinkedIn}
                className="gap-2"
            >
                <Linkedin className="w-4 h-4" />
                LinkedIn
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={shareViaEmail}
                className="gap-2"
            >
                <Mail className="w-4 h-4" />
                Email
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="gap-2"
            >
                <Link2 className="w-4 h-4" />
                Copy Link
            </Button>
        </div>
    );
}
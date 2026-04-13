import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from 'lucide-react';

export default function FeedbackDialog({ open, onClose, milestone, deliverable, projectId, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [category, setCategory] = useState('overall');

    const handleSubmit = () => {
        if (rating === 0 || !feedbackText.trim()) {
            alert('Please provide a rating and feedback');
            return;
        }

        onSubmit({
            project_id: projectId,
            milestone_id: milestone?.id,
            deliverable_id: deliverable?.id,
            rating,
            feedback_text: feedbackText,
            category
        });

        // Reset form
        setRating(0);
        setFeedbackText('');
        setCategory('overall');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Provide Feedback</DialogTitle>
                    {milestone && (
                        <p className="text-sm text-muted-foreground">
                            For milestone: {milestone.title}
                        </p>
                    )}
                    {deliverable && (
                        <p className="text-sm text-muted-foreground">
                            For deliverable: {deliverable.deliverable_name}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Rating *</Label>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="overall">Overall Experience</SelectItem>
                                <SelectItem value="quality">Quality of Work</SelectItem>
                                <SelectItem value="timeliness">Timeliness</SelectItem>
                                <SelectItem value="communication">Communication</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Your Feedback *</Label>
                        <Textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Share your thoughts, suggestions, or concerns..."
                            className="mt-2 min-h-[120px]"
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
                            Submit Feedback
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
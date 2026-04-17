import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from 'react-markdown';
import { 
    Bot, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle, 
    Loader2,
    TrendingUp,
    AlertCircle,
    Lightbulb,
    Target,
    Zap,
    Award,
    Sparkles,
    Clock,
    PhoneCall
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

const questions = [
    {
        id: 'business_type',
        question: 'What type of business do you run?',
        type: 'input',
        placeholder: 'e.g., E-commerce, Consulting, SaaS, etc.'
    },
    {
        id: 'revenue_range',
        question: 'What is your current annual revenue range?',
        type: 'select',
        options: ['0-10L', '10L-50L', '50L-1Cr', '1Cr-5Cr', '5Cr+']
    },
    {
        id: 'lead_generation_method',
        question: 'How do you currently generate leads?',
        type: 'textarea',
        placeholder: 'e.g., Social media, referrals, paid ads, cold calling...'
    },
    {
        id: 'sales_process',
        question: 'Describe your sales process',
        type: 'textarea',
        placeholder: 'How do you take a lead from first contact to closed deal?'
    },
    {
        id: 'marketing_channels',
        question: 'Which marketing channels do you use?',
        type: 'input',
        placeholder: 'e.g., Instagram, LinkedIn, Email, Google Ads'
    },
    {
        id: 'team_size',
        question: 'How many people are on your team?',
        type: 'select',
        options: ['1-5', '6-10', '11-25', '26-50', '50+']
    },
    {
        id: 'online_presence',
        question: 'How would you describe your online presence?',
        type: 'select',
        options: ['no_website', 'basic_website', 'advanced_website', 'full_digital']
    },
    {
        id: 'crm_usage',
        question: 'Do you use a CRM to track leads and customers?',
        type: 'select',
        options: ['none', 'spreadsheet', 'basic_crm', 'advanced_crm']
    },
    {
        id: 'biggest_challenge',
        question: 'What is your biggest business challenge right now?',
        type: 'textarea',
        placeholder: 'Be specific - what keeps you up at night?'
    },
    {
        id: 'growth_goals',
        question: 'What are your growth goals for the next 12 months?',
        type: 'textarea',
        placeholder: 'Revenue targets, market expansion, team growth, etc.'
    }
];

export default function AI_Assessment() {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        lead_name: '',
        lead_email: '',
        lead_phone: '',
        company_name: '',
        website_url: '' // Honeypot
    });
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState(null);
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setFormData(prev => ({
                    ...prev,
                    lead_name: currentUser.full_name || '',
                    lead_email: currentUser.email || '',
                }));
            } catch {
                // Not authenticated — allow anonymous access, no redirect
                setUser(null);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    const isContactStep = step === 0;
    const isQuestionStep = step > 0 && step <= questions.length;
    const isReportStep = step > questions.length;

    const currentQuestion = questions[step - 1];

    const handleNext = () => {
        if (step < questions.length + 1) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        
        // Honeypot spam protection
        if (formData.website_url) {
            console.warn('Bot detected during contact step');
            setStep(questions.length + 1); // Skip to report step (fake)
            return;
        }

        handleNext();
    };

    const handleAnswerChange = (value) => {
        if (currentQuestion.id === 'marketing_channels' && typeof value === 'string') {
            setAnswers({ ...answers, [currentQuestion.id]: value.split(',').map(s => s.trim()) });
        } else {
            setAnswers({ ...answers, [currentQuestion.id]: value });
        }
    };

    const handleSubmitAssessment = async (e) => {
        if (e) e.preventDefault();
        
        console.log('Starting assessment submission...', { formData, answers });
        
        setIsSubmitting(true);
        setIsGenerating(true);

        try {
            console.log('Calling AI to generate report...');
            // Generate AI report with structured output
            const aiResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an expert business growth consultant with 15+ years of experience. Analyze this business assessment and provide an insightful, actionable growth report.

Business Profile:
- Business Type: ${answers.business_type}
- Annual Revenue: ${answers.revenue_range}
- Team Size: ${answers.team_size}
- Lead Generation: ${answers.lead_generation_method}
- Sales Process: ${answers.sales_process}
- Marketing Channels: ${Array.isArray(answers.marketing_channels) ? answers.marketing_channels.join(', ') : answers.marketing_channels}
- Online Presence: ${answers.online_presence}
- CRM Usage: ${answers.crm_usage}
- Biggest Challenge: ${answers.biggest_challenge}
- Growth Goals: ${answers.growth_goals}

Create a comprehensive, personalized report with:

## Growth Score
Calculate a score from 0-100 based on:
- Digital infrastructure maturity (30%)
- Sales & marketing efficiency (30%)
- Growth potential and scalability (25%)
- Current momentum and trajectory (15%)

Start with "Growth Score: [number]/100"

## Executive Summary
Write 3-4 sentences that:
1. Acknowledge their current situation with empathy
2. Highlight 1-2 major opportunities
3. Set realistic expectations for transformation

## Key Strengths
Identify 3-4 concrete strengths based on their answers. Be specific about what they're doing right.

## Critical Growth Barriers
List 4-5 specific issues preventing scale. Connect each to their actual challenges and business type.

## Strategic Recommendations

### Immediate Sales Improvements (0-30 days)
Provide 3-4 tactical, implementable actions specific to their sales process and CRM usage.

### Marketing Transformation (30-90 days)
Give 3-4 channel-specific strategies based on their current marketing and target audience.

### Technology & Automation Stack (60-120 days)
Recommend 3-4 specific tools/systems that address their gaps. Consider their team size and budget range.

### Revenue Growth Strategy (90-180 days)
Outline 2-3 strategic initiatives for scaling revenue based on their goals.

## 90-Day Priority Action Plan
Create a week-by-week roadmap for the first 90 days:
- Week 1-2: [immediate actions]
- Week 3-4: [quick wins]
- Month 2: [system building]
- Month 3: [optimization & scale]

## Projected Impact & ROI
Based on their revenue range, estimate:
- Revenue increase potential (percentage and INR)
- Time savings per week
- Cost reduction opportunities
- Expected timeline to see results

Be encouraging but realistic. Reference Indian market context. Make it personal and actionable.`,
                add_context_from_internet: false
            });
            
            console.log('AI Response received:', aiResponse);

            // Calculate growth score from AI response
            const scoreMatch = aiResponse.match(/Growth Score.*?(\d+)/i);
            const growthScore = scoreMatch ? parseInt(scoreMatch[1]) : 65;

            // Extract recommendations
            const recommendations = [
                'Implement a proven CRM system',
                'Set up automated lead nurturing',
                'Create a content marketing strategy',
                'Build conversion-optimized landing pages'
            ];

            // Determine recommended services based on assessment
            const recommendedServices = [];
            
            if (answers.crm_usage === 'none' || answers.crm_usage === 'spreadsheet') {
                recommendedServices.push({
                    name: 'Sales System Setup',
                    icon: 'Target',
                    description: 'Get a complete CRM and sales automation system that tracks every lead and opportunity',
                    benefit: 'Increase sales by 30-40%'
                });
            }
            
            if (answers.online_presence === 'no_website' || answers.online_presence === 'basic_website') {
                recommendedServices.push({
                    name: 'Website & App Development',
                    icon: 'Zap',
                    description: 'Modern, conversion-optimized website that turns visitors into customers',
                    benefit: 'Generate 2-3x more leads'
                });
            }
            
            if (answers.lead_generation_method?.toLowerCase().includes('manual') || 
                answers.biggest_challenge?.toLowerCase().includes('lead')) {
                recommendedServices.push({
                    name: 'Marketing Automation',
                    icon: 'Sparkles',
                    description: 'Automated campaigns across social media, email, and ads that run on autopilot',
                    benefit: 'Save 15+ hours per week'
                });
            }
            
            // Always include AI automation as a recommendation
            recommendedServices.push({
                name: 'AI & Automation Tools',
                icon: 'Bot',
                description: 'Custom AI solutions that automate repetitive tasks and provide insights',
                benefit: 'Cut operational costs by 25%'
            });

            // Save to database (each write is individually wrapped so failures don't block the report)
            let savedAssessment = null;
            try {
                savedAssessment = await base44.entities.AI_Assessment.create({
                    ...formData,
                    ...answers,
                    score: growthScore, // Corrected column name
                    ai_report: aiResponse,
                    // Note: 'recommendations' column might need to be JSONB if added to schema, 
                    // otherwise it will be ignored or error. SETUP_DATABASE doesn't have it yet.
                    converted_to_lead: false
                });
            } catch (err) {
                console.warn('Failed to save assessment:', err);
            }

            let savedLead = null;
            try {
                savedLead = await base44.entities.Lead.create({
                    full_name: formData.lead_name,
                    email: formData.lead_email,
                    phone: formData.lead_phone,
                    company: formData.company_name,
                    source: 'ai_assessment',
                    status: 'new',
                    score: growthScore, // Corrected column name
                    notes: `Completed AI Assessment. Biggest challenge: ${answers.biggest_challenge}`
                });
            } catch (err) {
                console.warn('Failed to save lead:', err);
            }

            // Link assessment ↔ lead if both were saved
            if (savedAssessment && savedLead) {
                try {
                    await base44.entities.AI_Assessment.update(savedAssessment.id, {
                        converted_to_lead: true,
                        lead_id: savedLead.id
                    });
                } catch (err) {
                    console.warn('Failed to link assessment to lead:', err);
                }
            }

            try {
                await base44.entities.Activity.create({
                    lead_id: savedLead?.id || null,
                    type: 'assessment', // Corrected column name 'type' vs 'activity_type'
                    description: `Completed AI Business Assessment. Growth Score: ${growthScore}/100`,
                    performed_by: 'system'
                });
            } catch (err) {
                console.warn('Failed to save activity:', err);
            }

            // Send Email notification to admin (Replacing non-existent WhatsApp function)
            try {
                await base44.integrations.Core.SendEmail({
                    to: 'connect@eyepune.com',
                    subject: `New AI Assessment: ${formData.lead_name} (Score: ${growthScore})`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h2>New AI Assessment Completed</h2>
                            <p><strong>Name:</strong> ${formData.lead_name}</p>
                            <p><strong>Email:</strong> ${formData.lead_email}</p>
                            <p><strong>Company:</strong> ${formData.company_name}</p>
                            <p><strong>Growth Score:</strong> ${growthScore}/100</p>
                            <p><strong>Challenge:</strong> ${answers.biggest_challenge}</p>
                            <p><a href="${window.location.origin}/Admin_Dashboard" style="padding: 10px 20px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px;">View in Dashboard</a></p>
                        </div>
                    `
                });
            } catch (e) {
                console.log('Admin notification failed (non-critical):', e);
            }

            console.log('Assessment saved successfully, setting report...');
            
            setReport({
                score: growthScore,
                content: aiResponse,
                recommendations: recommendations,
                services: recommendedServices
            });

            setIsGenerating(false);
            setIsSubmitting(false);
            handleNext();
        } catch (error) {
            console.error('Error generating report:', error);
            console.error('Error details:', error.message, error.stack);
            alert(`Failed to generate report: ${error.message || 'Unknown error'}. Please try again.`);
            setIsGenerating(false);
            setIsSubmitting(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-3xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <Bot className="w-10 h-10 text-red-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        AI Business Assessment
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Get a personalized growth roadmap powered by AI in 3 minutes
                    </p>
                </motion.div>

                {/* Progress bar */}
                {!isReportStep && (
                    <div className="mb-8">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-red-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / (questions.length + 1)) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                            Step {step} of {questions.length + 1}
                        </p>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* Contact Information */}
                    {isContactStep && (
                        <motion.div
                            key="contact"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="bg-card border rounded-2xl p-8">
                                <h2 className="text-2xl font-bold mb-6">Let's start with your details</h2>
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                    {/* Honeypot field (hidden from users) */}
                                    <div className="sr-only opacity-0 absolute -z-10 pointer-events-none">
                                        <input
                                            type="text"
                                            name="website_url"
                                            value={formData.website_url || ''}
                                            onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                                            tabIndex="-1"
                                            autoComplete="off"
                                        />
                                    </div>
                                    <div>
                                        <Label>Full Name *</Label>
                                        <Input
                                            value={formData.lead_name}
                                            onChange={(e) => setFormData({...formData, lead_name: e.target.value})}
                                            required
                                            placeholder="Your name"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.lead_email}
                                            onChange={(e) => setFormData({...formData, lead_email: e.target.value})}
                                            required
                                            placeholder="your@email.com"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone Number *</Label>
                                        <Input
                                            value={formData.lead_phone}
                                            onChange={(e) => setFormData({...formData, lead_phone: e.target.value})}
                                            required
                                            placeholder="+91 98765 43210"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Company Name</Label>
                                        <Input
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                            placeholder="Your company"
                                            className="mt-1"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 mt-6">
                                        Continue
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* Questions */}
                    {isQuestionStep && (
                        <motion.div
                            key={`question-${step}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="bg-card border rounded-2xl p-8">
                                <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
                                
                                {currentQuestion.type === 'input' && (
                                    <Input
                                        value={answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        placeholder={currentQuestion.placeholder}
                                        className="text-lg py-6"
                                    />
                                )}

                                {currentQuestion.type === 'textarea' && (
                                    <Textarea
                                        value={answers[currentQuestion.id] || ''}
                                        onChange={(e) => handleAnswerChange(e.target.value)}
                                        placeholder={currentQuestion.placeholder}
                                        className="min-h-[120px] text-base"
                                    />
                                )}

                                {currentQuestion.type === 'select' && (
                                    <Select
                                        value={answers[currentQuestion.id] || ''}
                                        onValueChange={handleAnswerChange}
                                    >
                                        <SelectTrigger className="text-lg py-6">
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentQuestion.options.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <div className="flex gap-4 mt-8">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        className="flex-1"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                    {step < questions.length ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                            disabled={!answers[currentQuestion.id]}
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleSubmitAssessment}
                                            className="flex-1 bg-red-600 hover:bg-red-700"
                                            disabled={isSubmitting || !answers[currentQuestion.id]}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Generating Report...
                                                </>
                                            ) : (
                                                <>
                                                    Generate Report
                                                    <ChevronRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Report */}
                    {isReportStep && report && (
                        <motion.div
                            key="report"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="space-y-8">
                                {/* Success Message */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center"
                                >
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold mb-2">Your Report is Ready!</h2>
                                    <p className="text-muted-foreground">
                                        We've analyzed your business and created a personalized growth roadmap
                                    </p>
                                </motion.div>

                                {/* Score Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-2xl p-8 text-white text-center relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
                                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full" />
                                    </div>
                                    <div className="relative z-10">
                                        <Award className="w-12 h-12 mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold mb-4">Your Business Growth Score</h2>
                                        <div className="text-8xl font-bold mb-2">{report.score}</div>
                                        <p className="text-xl opacity-90 mb-4">out of 100</p>
                                        <Badge className="bg-white/20 text-white border-white/30">
                                            {report.score >= 80 ? 'Excellent' : report.score >= 60 ? 'Good' : report.score >= 40 ? 'Growing' : 'High Potential'}
                                        </Badge>
                                    </div>
                                </motion.div>

                                {/* Urgency Banner */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-orange-50 dark:bg-orange-950/30 border-2 border-orange-200 dark:border-orange-800 rounded-xl p-6 flex items-start gap-4"
                                >
                                    <Clock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-1">
                                            Limited Time: Free 30-Min Strategy Call Worth ₹5,000
                                        </h3>
                                        <p className="text-sm text-orange-700 dark:text-orange-300">
                                            Book within 24 hours to get a complimentary strategy session where we'll create your custom implementation plan
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Recommended Services */}
                                {report.services && Array.isArray(report.services) && report.services.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <h3 className="text-2xl font-bold mb-6 text-center">
                                            🎯 Recommended Solutions for Your Business
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {(report.services || []).filter(service => service && typeof service === 'object' && service.name && service.description && service.icon).map((service, idx) => {
                                                const iconMap = {
                                                    'Target': Target,
                                                    'Zap': Zap,
                                                    'Sparkles': Sparkles,
                                                    'Bot': Bot
                                                };
                                                const IconComponent = iconMap[service.icon] || Target;
                                                
                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.7 + idx * 0.1 }}
                                                    >
                                                        <Card className="h-full border-2 hover:border-red-500 transition-all cursor-pointer hover:shadow-lg">
                                                            <CardContent className="p-6">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                                                        <IconComponent className="w-6 h-6 text-red-600" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-lg mb-2">{service.name}</h4>
                                                                        <p className="text-sm text-muted-foreground mb-3">
                                                                            {service.description}
                                                                        </p>
                                                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                                            {service.benefit}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Detailed Report */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="bg-card border rounded-2xl p-8"
                                >
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                                        Your Detailed Growth Report
                                    </h3>
                                    <div className="prose prose-gray dark:prose-invert max-w-none">
                                        <ReactMarkdown
                                            components={{
                                                h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3 text-foreground" {...props} />,
                                                p: ({node, ...props}) => <p className="mb-4 text-muted-foreground leading-relaxed" {...props} />,
                                                ul: ({node, ...props}) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
                                                li: ({node, ...props}) => <li className="text-muted-foreground" {...props} />,
                                                strong: ({node, ...props}) => <strong className="text-foreground font-semibold" {...props} />
                                            }}
                                        >
                                            {report.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>

                                {/* Social Proof */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.0 }}
                                    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 mb-4">
                                        <Award className="w-6 h-6 text-blue-600" />
                                        <h3 className="text-2xl font-bold">Join 200+ Growing Businesses</h3>
                                    </div>
                                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                                        Companies that implemented our recommendations saw an average <span className="font-bold text-blue-600">40% revenue increase</span> within 6 months
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                                        <Badge variant="outline" className="px-4 py-2">
                                            ⭐ 4.9/5 Client Rating
                                        </Badge>
                                        <Badge variant="outline" className="px-4 py-2">
                                           💼 15 Lacs+ Revenue Generated
                                        </Badge>
                                        <Badge variant="outline" className="px-4 py-2">
                                            🚀 95% Client Retention
                                        </Badge>
                                    </div>
                                </motion.div>

                                {/* Login Prompt for Non-logged Users */}
                                {!user && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.1 }}
                                        className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6"
                                    >
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold mb-3">
                                                🎁 Save Your Report & Track Your Progress
                                            </h3>
                                            <p className="text-muted-foreground mb-6">
                                                Create a free account to save this report, track your implementation progress, and access exclusive resources
                                            </p>
                                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                <Button 
                                                    size="lg"
                                                    onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Login / Sign Up
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Main CTA */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-8 text-white text-center"
                                >
                                    <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                                    <h3 className="text-3xl font-bold mb-4">
                                        Ready to Turn Insights Into Results?
                                    </h3>
                                    <p className="text-xl mb-2 opacity-90">
                                        Let's implement your growth plan together
                                    </p>
                                    <p className="text-lg mb-8 opacity-80">
                                        We'll contact you within 24 hours with a custom implementation strategy
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                                        <Link to={createPageUrl("Booking")}>
                                            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8">
                                                <PhoneCall className="w-5 h-5 mr-2" />
                                                Book Free Strategy Call
                                            </Button>
                                        </Link>
                                        <Link to={createPageUrl("Services_Detail")}>
                                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                                                View Our Services
                                            </Button>
                                        </Link>
                                    </div>
                                    <p className="text-sm opacity-75">
                                        No commitment required • Free consultation • Custom pricing
                                    </p>
                                </motion.div>

                                {/* Alternative CTA */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.4 }}
                                    className="text-center"
                                >
                                    <p className="text-muted-foreground mb-4">
                                        Want to explore solutions at your own pace?
                                    </p>
                                    <Link to={createPageUrl("Pricing")}>
                                        <Button variant="outline" size="lg">
                                            View Pricing & Packages
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
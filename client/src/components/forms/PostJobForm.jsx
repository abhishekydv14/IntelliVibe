// client/src/components/forms/PostJobForm.jsx
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/DatePicker";
import { Loader2 } from 'lucide-react';

// Updated Zod schema to match your backend model
const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    companyName: z.string().min(2, "Company name is required."),
    skills: z.string().min(2, "At least one skill is required."),
    location: z.string().min(2, "Location is required."),
    salary: z.string().optional(),
    jobType: z.string().optional(),
    expiryDate: z.date().optional(),
    isActive: z.boolean().default(true),
    interviewDuration: z.string().optional(),
    description: z.string().min(30, "Description must be at least 30 characters."),
});

const PostJobForm = ({ onJobPosted }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { userInfo } = useAuth();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            companyName: "",
            skills: "",
            location: "",
            salary: "",
            jobType: "Full-time",
            isActive: true,
            interviewDuration: "30",
            description: "",
        },
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        setApiError(null);

        // Check for authentication and employer role
        if (!userInfo || !userInfo.token) {
            setApiError("You must be logged in as an employer to post a job.");
            setIsLoading(false);
            return;
        }
        if (userInfo.role !== 'employer') {
            setApiError("Only employers can post jobs. Please log in with an employer account.");
            setIsLoading(false);
            return;
        }

        try {
            console.log("onSubmit called");
            console.log(userInfo.token);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            // Prepare the data with proper formatting
            const postData = {
                title: values.title,
                companyName: values.companyName,
                skills: values.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0),
                location: values.location,
                description: values.description,
                isActive: values.isActive,
                jobType: values.jobType || "Full-time",
                // Only include optional fields if they have values
                ...(values.salary && { salary: values.salary }),
                ...(values.expiryDate && { expiryDate: values.expiryDate.toISOString() }),
                ...(values.interviewDuration && { interviewDuration: parseInt(values.interviewDuration, 10) }),
            };

            console.log("Sending data to create job:", postData);

            const { data } = await axios.post('http://localhost:5001/api/jobs', postData, config);
            
            onJobPosted(data);
            form.reset();
        } catch (error) {
            console.error("Frontend error creating job:", error);
            console.error("Error response:", error.response);
            let errorMessage = "An unexpected error occurred. Please check the console.";
            if (error.response) {
                errorMessage = `Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = "No response from server. Please check your network connection or backend server.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            setApiError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // AI Description Generation
    const handleGenerateDescription = async () => {
        setIsGenerating(true);
        setApiError(null);
        try {
            // Prepare prompt data from form values
            const values = form.getValues();
            const payload = {
                title: values.title,
                companyName: values.companyName,
                skills: values.skills,
                location: values.location,
                // Add more fields if your AI endpoint expects them
            };
            const { data } = await axios.post('http://localhost:5001/api/ai/generate-job-description', payload, userInfo?.token ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {});
            if (data && data.description) {
                form.setValue('description', data.description, { shouldValidate: true });
            } else {
                setApiError('AI did not return a description.');
            }
        } catch (error) {
            setApiError('Failed to generate description.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField 
                            control={form.control} 
                            name="title" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Software Engineer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField 
                            control={form.control} 
                            name="companyName" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Acme Inc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField 
                            control={form.control} 
                            name="skills" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skills</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., javascript, react, nodejs" {...field} />
                                    </FormControl>
                                    <FormDescription>Comma-separated list of skills.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField 
                            control={form.control} 
                            name="location" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField 
                            control={form.control} 
                            name="salary" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salary (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., $80,000 - $100,000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField 
                            control={form.control} 
                            name="jobType" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select job type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Controller 
                            control={form.control} 
                            name="expiryDate" 
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Expiry Date (Optional)</FormLabel>
                                    <DatePicker value={field.value} onChange={field.onChange} />
                                    <FormDescription>When should this job posting expire?</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <FormField 
                            control={form.control} 
                            name="interviewDuration" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Interview Duration</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select max duration" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="45">45 minutes</SelectItem>
                                            <SelectItem value="60">60 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>Maximum duration for AI video interviews</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField 
                        control={form.control} 
                        name="isActive" 
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Job Status</FormLabel>
                                    <FormDescription>
                                        Set whether this job is active and visible to candidates.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField 
                        control={form.control} 
                        name="description" 
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Job Description</FormLabel>
                                <div className="flex justify-end -mb-2">
                                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                                        {isGenerating ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                        ) : (
                                            'Generate with AI'
                                        )}
                                    </Button>
                                </div>
                                <FormControl>
                                    <Textarea 
                                        placeholder="Enter job description or generate with AI" 
                                        rows={6} 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {apiError && (
                        <div className="bg-destructive/15 text-destructive px-3 py-2 rounded-md text-sm">
                            {apiError}
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onJobPosted(null)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                    Creating...
                                </>
                            ) : (
                                'Create Job'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default PostJobForm;
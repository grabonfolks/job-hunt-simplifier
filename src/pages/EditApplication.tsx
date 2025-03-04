
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Job, ApplicationStatus } from '@/types/types';
import { getJob, updateJob, getMongoDBConfig } from '@/lib/storage';
import { ArrowLeft, Save, Database, HardDrive } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { toast } from 'sonner';

const EditApplication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingJob, setLoadingJob] = useState(true);
  const mongoConfig = getMongoDBConfig();
  
  // Form state
  const [formData, setFormData] = useState<Omit<Job, 'id' | 'lastUpdated'>>({
    companyName: '',
    position: '',
    location: '',
    applicationDate: '',
    status: 'applied',
    salary: '',
    url: '',
    jobDescription: '',
    notes: '',
    contactName: '',
    contactEmail: '',
    resumePath: '',
    coverLetterPath: '',
  });
  
  // Load job data
  useEffect(() => {
    if (!id) return;
    
    const loadJob = async () => {
      setLoadingJob(true);
      try {
        const jobData = await getJob(id);
        if (jobData) {
          setFormData({
            companyName: jobData.companyName || '',
            position: jobData.position || '',
            location: jobData.location || '',
            applicationDate: jobData.applicationDate || '',
            status: jobData.status,
            salary: jobData.salary || '',
            url: jobData.url || '',
            jobDescription: jobData.jobDescription || '',
            notes: jobData.notes || '',
            contactName: jobData.contactName || '',
            contactEmail: jobData.contactEmail || '',
            resumePath: jobData.resumePath || '',
            coverLetterPath: jobData.coverLetterPath || '',
          });
        } else {
          toast.error('Application not found');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        toast.error('Failed to load application details');
      } finally {
        setLoadingJob(false);
      }
    };
    
    loadJob();
  }, [id, navigate]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, applicationDate: date.toISOString() }));
    }
  };
  
  // Handle file uploads
  const handleFileChange = (fileType: 'resumePath' | 'coverLetterPath', file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setFormData(prev => ({ ...prev, [fileType]: e.target.result }));
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [fileType]: '' }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    setIsLoading(true);
    try {
      const updatedJob: Job = {
        id,
        ...formData,
        lastUpdated: new Date().toISOString(),
      };
      
      await updateJob(updatedJob);
      toast.success('Application updated successfully');
      navigate(`/application/${id}`);
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update application');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center">
            {mongoConfig.enabled ? (
              <div className="flex items-center text-sm text-muted-foreground mr-4">
                <Database className="h-4 w-4 mr-1 text-primary" />
                MongoDB
              </div>
            ) : (
              <div className="flex items-center text-sm text-muted-foreground mr-4">
                <HardDrive className="h-4 w-4 mr-1" />
                Local Storage
              </div>
            )}
          </div>
        </div>
        
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Application</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Company Information</h2>
                
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">Company Name</label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="position" className="text-sm font-medium">Position</label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Enter job position"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">Location</label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Enter job location"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="salary" className="text-sm font-medium">Salary</label>
                  <Input
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="Enter salary information"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="url" className="text-sm font-medium">Job URL</label>
                  <Input
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="Enter job posting URL"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Application Details</h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Application Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.applicationDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.applicationDate ? format(new Date(formData.applicationDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.applicationDate ? new Date(formData.applicationDate) : undefined}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contactName" className="text-sm font-medium">Contact Name</label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    placeholder="Enter contact person's name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="text-sm font-medium">Contact Email</label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="Enter contact email"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  label="Upload Resume"
                  value={formData.resumePath}
                  onChange={(file) => handleFileChange('resumePath', file)}
                  accept=".pdf,.doc,.docx"
                />
                
                <FileUpload
                  label="Upload Cover Letter"
                  value={formData.coverLetterPath}
                  onChange={(file) => handleFileChange('coverLetterPath', file)}
                  accept=".pdf,.doc,.docx"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Job Description</h2>
              <Textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Enter job description"
                rows={5}
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add notes about this application"
                rows={5}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditApplication;

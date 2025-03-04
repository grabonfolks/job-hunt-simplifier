
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FileUpload from '@/components/FileUpload';
import { addJob, storeFile, getMongoDBConfig } from '@/lib/storage';
import { ApplicationStatus, Job } from '@/types/types';
import { ArrowLeft, Briefcase, Building, Calendar, FileText, MapPin, Database, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

const AddApplication = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mongoConfig = getMongoDBConfig();
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    location: '',
    jobDescription: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'applied' as ApplicationStatus,
    salary: '',
    url: '',
    contactName: '',
    contactEmail: '',
    notes: ''
  });
  
  // File state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Process files
      let resumePath = '';
      let coverLetterPath = '';
      
      if (resumeFile) {
        resumePath = await storeFile(resumeFile);
      }
      
      if (coverLetterFile) {
        coverLetterPath = await storeFile(coverLetterFile);
      }
      
      // Create job object
      const newJob = {
        ...formData,
        resumePath,
        coverLetterPath
      };
      
      // Add job to storage
      await addJob(newJob);
      
      toast.success('Application added successfully');
      
      // Navigate back to dashboard
      navigate('/');
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add job application');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Add New Application
          </h1>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {mongoConfig.enabled ? (
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-1 text-primary" />
                MongoDB
              </div>
            ) : (
              <div className="flex items-center">
                <HardDrive className="h-4 w-4 mr-1" />
                Local Storage
              </div>
            )}
          </div>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Company Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Google, Amazon, etc."
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">Company Website / Job URL</Label>
                  <Input
                    id="url"
                    name="url"
                    placeholder="https://company.com/job"
                    value={formData.url}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Job Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position" className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    Position
                  </Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="Software Engineer, Product Manager, etc."
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="San Francisco, Remote, etc."
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">Expected Salary</Label>
                  <Input
                    id="salary"
                    name="salary"
                    placeholder="$100,000, $80-90k, etc."
                    value={formData.salary}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="applicationDate" className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Application Date
                  </Label>
                  <Input
                    id="applicationDate"
                    name="applicationDate"
                    type="date"
                    value={formData.applicationDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    name="jobDescription"
                    placeholder="Paste the job description here..."
                    rows={5}
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Application Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Current Status</Label>
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
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">Resume / CV</Label>
                  <FileUpload
                    label="Resume / CV"
                    onChange={setResumeFile}
                    accept=".pdf,.doc,.docx"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Cover Letter</Label>
                  <FileUpload
                    label="Cover Letter"
                    onChange={setCoverLetterFile}
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Additional Notes</h2>
              
              <div>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any personal notes about this application..."
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Application'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddApplication;


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Job, ApplicationStatus } from '@/types/types';
import { getJob, updateJob, deleteJob, getMongoDBConfig } from '@/lib/storage';
import { 
  ArrowLeft, Building, Briefcase, MapPin, Link as LinkIcon, 
  Calendar, DollarSign, User, Mail, FileText, Trash2, 
  ExternalLink, Download, PenSquare, Database, HardDrive, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ViewApplication = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mongoConfig = getMongoDBConfig();
  
  // Load job data
  useEffect(() => {
    if (!id) return;
    
    const loadJob = async () => {
      setIsLoading(true);
      try {
        const jobData = await getJob(id);
        if (jobData) {
          setJob(jobData);
          setError(null);
        } else {
          setError('Application not found');
          toast.error('Application not found');
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error('Error loading job:', error);
        setError('Failed to load application details');
        toast.error('Failed to load application details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJob();
  }, [id, navigate]);
  
  // Handle status change
  const handleStatusChange = async (status: string) => {
    if (!job) return;
    
    try {
      const updatedJob: Job = {
        ...job,
        status: status as ApplicationStatus
      };
      
      await updateJob(updatedJob);
      setJob(updatedJob);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    }
  };
  
  // Handle job deletion
  const handleDelete = async () => {
    if (!job || !job.id) return;
    
    setIsDeleting(true);
    try {
      await deleteJob(job.id);
      toast.success('Application deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete application');
      setIsDeleting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Handle file download
  const handleFileDownload = (fileUrl?: string, filename?: string) => {
    if (!fileUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading application details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold">{error}</h3>
              <Button onClick={() => navigate('/')}>
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 sm:mb-0 flex items-center gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-2">
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
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your application data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Link to={`/edit-application/${job.id}`}>
              <Button className="flex items-center gap-2">
                <PenSquare className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Building className="h-4 w-4" />
                    <span className="text-sm font-medium">{job.companyName || 'Company not specified'}</span>
                  </div>
                  <h1 className="text-2xl font-bold">{job.position || 'Position not specified'}</h1>
                </div>
                
                <StatusBadge status={job.status} className="mt-3 sm:mt-0" />
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                )}
                
                {job.applicationDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Applied on {formatDate(job.applicationDate)}</span>
                  </div>
                )}
                
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{job.salary}</span>
                  </div>
                )}
                
                {job.url && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={job.url.startsWith('http') ? job.url : `https://${job.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 flex items-center"
                    >
                      View Job Posting
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
              
              {(job.contactName || job.contactEmail) && (
                <>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {job.contactName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{job.contactName}</span>
                      </div>
                    )}
                    
                    {job.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${job.contactEmail}`}
                          className="text-primary underline underline-offset-2"
                        >
                          {job.contactEmail}
                        </a>
                      </div>
                    )}
                  </div>
                  <Separator className="my-4" />
                </>
              )}
              
              {job.jobDescription && (
                <>
                  <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                  <div className="bg-muted/30 p-4 rounded-md max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap">{job.jobDescription}</pre>
                  </div>
                </>
              )}
            </Card>
            
            {job.notes && (
              <Card className="p-6 animate-fade-in animation-delay-100">
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                <div className="bg-muted/30 p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{job.notes}</p>
                </div>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card className="p-6 animate-fade-in animation-delay-200">
              <h3 className="text-lg font-semibold mb-4">Application Status</h3>
              
              <Select
                value={job.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                </SelectContent>
              </Select>
              
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {formatDate(job.lastUpdated)}
              </p>
            </Card>
            
            <Card className="p-6 animate-fade-in animation-delay-300">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Resume / CV</p>
                  {job.resumePath ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleFileDownload(job.resumePath, `${job.companyName || 'Company'}_Resume.pdf`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No resume uploaded</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Cover Letter</p>
                  {job.coverLetterPath ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleFileDownload(job.coverLetterPath, `${job.companyName || 'Company'}_CoverLetter.pdf`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Cover Letter
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground">No cover letter uploaded</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewApplication;

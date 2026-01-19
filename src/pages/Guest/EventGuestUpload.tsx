import { useState } from "react";
import { useParams } from "react-router-dom";
import { UploadDropzone } from "@/components/laney/UploadDropzone";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion"; // Assuming you have framer-motion or standard css

export const EventGuestUpload = () => {
  const { eventId } = useParams();
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Mock event data (replace with DB fetch later)
  const eventName = "Summer Gala 2024";

  const handleUploadComplete = (files: File[]) => {
    // In a real app, this is where we'd confirm the upload batch to the server
    console.log("Uploaded to event:", eventId, files);
    setHasUploaded(true);
  };

  if (hasUploaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-orange-50 to-pink-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 max-w-sm w-full"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanks!</h2>
          <p className="text-gray-600 mb-8">
            Your photos have been added to the {eventName} collection.
          </p>
          <Button 
            onClick={() => setHasUploaded(false)}
            variant="outline"
            className="w-full h-12 rounded-xl"
          >
            Upload More
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="p-6 text-center bg-card border-b border-border sticky top-0 z-10">
        <h1 className="font-bold text-xl text-foreground">{eventName}</h1>
        <p className="text-sm text-muted-foreground">Shared Album</p>
      </div>

      {/* Upload Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
            <Camera className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Add your photos</h2>
          <p className="text-muted-foreground">
            Help us create the memories for tonight!
          </p>
        </div>

        {/* Reuse your existing Dropzone but style it for mobile "Tap" */}
        <div className="w-full">
           <UploadDropzone 
             onFilesSelected={handleUploadComplete}
             isDragging={isDragging}
             setIsDragging={setIsDragging}
             className="h-64 border-2 border-dashed border-primary/30 bg-primary/5 rounded-3xl hover:bg-primary/10 transition-colors"
           />
        </div>

        <p className="text-xs text-muted-foreground text-center mt-auto">
          Powered by Laney AI
        </p>
      </div>
    </div>
  );
};

export default EventGuestUpload;
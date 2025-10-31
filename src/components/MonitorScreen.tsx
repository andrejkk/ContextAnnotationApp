import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Recording {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  status: string;
  video_url: string | null;
}

interface MonitorScreenProps {
  onBack: () => void;
}

export const MonitorScreen = ({ onBack }: MonitorScreenProps) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;

      setRecordings(data || []);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recordings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-lg font-semibold">Monitor Mode</h1>
        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading recordings...</p>
          </div>
        ) : recordings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No recordings found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start recording to see your sessions here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <Card key={recording.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatDate(recording.start_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Duration: {formatDuration(recording.duration_seconds)}
                      </span>
                    </div>
                  </div>
                  <Badge variant={recording.status === 'completed' ? 'default' : 'secondary'}>
                    {recording.status}
                  </Badge>
                </div>
                
                {recording.video_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedRecording(recording)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    View Recording
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedRecording && selectedRecording.video_url && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recording Playback</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRecording(null)}>
                Close
              </Button>
            </div>
            <video
              src={selectedRecording.video_url}
              controls
              className="w-full aspect-video bg-muted"
            />
          </Card>
        </div>
      )}
    </div>
  );
};
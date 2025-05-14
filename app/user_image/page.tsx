"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ImageVisionUploader() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tag, setTag] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [resultJson, setResultJson] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !tag) return alert('Please upload an image and a tag.');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('tag', tag);

    await fetch('https://backend.api/upload', {
      method: 'POST',
      body: formData
    });

    alert('Image uploaded and sent to Kafka topic. Wait for processing.');

    checkResult();

    setTimeout(() => {
      checkResult();
    }, 3000);
  };

  const checkResult = async () => {
    if (!tag) return alert('Enter a tag to fetch result.');

    setLoading(true);

    const res = await fetch(`https://backend.api/result?tag=${tag}`);
    const data = await res.json();

    setProcessedImageUrl(data.annotatedImageUrl);
    setResultJson(data.metadata);
    setLoading(false);
  };

  return (
    <div className="pt-20 grid gap-6 max-w-6xl mx-auto">
      <p className="text-sm text-muted-foreground">
        Upload an image to send to Kafka and receive object detection results.
      </p>

      {/* Upload Form */}
      <Card className="grid md:grid-cols-2 gap-4">
        <CardContent className="p-4">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="rounded w-full" />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-muted">
              No image uploaded
            </div>
          )}
        </CardContent>

        <CardContent className="p-4 space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          <Textarea
            placeholder="Enter a tag (e.g. subway, person)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <Button onClick={handleSubmit}>Submit</Button>
        </CardContent>
      </Card>

      {/* Result Section */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            {processedImageUrl ? (
              <img src={processedImageUrl} alt="Processed result" className="rounded w-full" />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-muted">
                No processed image available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loading ? (
              <p className="text-muted">Fetching result...</p>
            ) : resultJson ? (
              <pre className="overflow-x-auto whitespace-pre-wrap text-sm bg-gray-900 text-white p-4 rounded">
                {JSON.stringify(resultJson, null, 2)}
              </pre>
            ) : (
              <p className="text-muted">No result metadata available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

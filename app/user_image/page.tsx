"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ImageVisionUploader() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tag, setTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !tag) return alert('Please upload an image and provide a tag');

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('tag', tag);

    await fetch('/api/kafka-upload', {
      method: 'POST',
      body: formData
    });

    alert('Image sent to Kafka topic');
  };

  return (
    <div className="p-6 grid gap-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Easily apply breakthrough computer vision</h1>
      <p className="text-sm text-muted-foreground">Upload an image to send to Kafka and process through Airflow and YOLO</p>

      <Card className="grid md:grid-cols-2 gap-4">
        <CardContent className="p-4">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="rounded w-full" />
          ) : (
            <div className="w-full h-64 flex items-center justify-center text-muted">No image uploaded</div>
          )}
        </CardContent>

        <CardContent className="p-4 space-y-4">
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          <Textarea placeholder="Enter a tag (e.g. subway, person)" value={tag} onChange={(e) => setTag(e.target.value)} />
          <Button onClick={handleSubmit}>Submit</Button>
        </CardContent>
      </Card>
    </div>
  );
}

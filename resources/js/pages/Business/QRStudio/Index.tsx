import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { Download, Upload, RefreshCw, X, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ModuleHeading from "@/components/module-heading";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { toast } from 'sonner';

interface QRCodeData {
  heading: string;
  subheading: string;
  backgroundColor: string;
  textColor: string;
  backgroundImage: File | null;
  logo: File | null;
}

interface IndexProps {
  qrUrl: string;
  qrCode?: {
    heading: string;
    subheading: string;
    background_color: string;
    text_color: string;
    background_image: string | null;
    logo: string | null;
  };
  errors?: Record<string, string>;
}

export default function Index({ qrCode }: IndexProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(qrCode?.logo ? "/" + qrCode.logo : null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(qrCode?.background_image ? "/" + qrCode.background_image : null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const {post, data, setData, reset, processing, errors } = useForm<QRCodeData>({
    heading: qrCode?.heading || 'Taylora',
    subheading: qrCode?.subheading || 'Join our loyalty program by scanning the QR code',
    backgroundColor: qrCode?.background_color || '#ffffff',
    textColor: qrCode?.text_color || '#000000',
    backgroundImage: null,
    logo: null
  });

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo file size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setData('logo', file);
    }
  };

  const handleBackgroundUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Background image file size must be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setData('backgroundImage', file);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    
    post('/business/qr-studio/update', {
      onSuccess: () => {
        toast.success('QR Code settings saved successfully!')
      },
      onError: () => {
       toast.error("An error occured while trying to generate.")
      }
    });
  };

  const handleDownload = () => {
    setIsDownloading(true);
    window.location.href = '/business/qr-studio/download';
    setTimeout(() => setIsDownloading(false), 2000);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setData('logo', null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const removeBackground = () => {
    setBackgroundPreview(null);
    setData('backgroundImage', null);
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = '';
    }
  };

  const resetToDefault = () => {
    reset();
    setLogoPreview(null);
    setBackgroundPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
    if (backgroundInputRef.current) backgroundInputRef.current.value = '';
  };

  const previewStyle: React.CSSProperties = {
    backgroundColor: data.backgroundColor,
    color: data.textColor,
    ...(backgroundPreview && {
      backgroundImage: `url(${backgroundPreview})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    })
  };

  return (
    <AppLayout>
      <Head title="QR Studio" />
      <ModuleHeading title="QR Studio" description="Manage your business QR code settings." />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Preview Panel - Shows first on mobile */}
          <div className="order-first lg:order-last">
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is how your QR code menu will look when printed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="aspect-[8.5/11] border-2 shadow-lg mx-auto w-full max-w-sm lg:max-w-md relative overflow-hidden"
                  style={previewStyle}
                >
                  {backgroundPreview && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                  )}
                  <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 border-4 sm:border-8" style={{ borderColor: data.textColor }}>
                    {/* Heading */}
                    <h1 className="text-xl font-serif italic mb-2 lg:text-4xl text-center" style={{ color: data.textColor }}>
                      {data.heading}
                    </h1>

                    {/* Subheading */}    
                    <p className="text-center text-[10px] md:text-xs mb-4 sm:mb-6 lg:mb-8 whitespace-pre-line px-2" style={{ color: data.textColor }}>
                      {data.subheading}
                    </p>

                    {/* QR Code Placeholder */}
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-white p-2 mb-4 sm:mb-6 lg:mb-8 shadow-lg">
                      <div className="text-center w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                        QR Code will show here
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="p-2 sm:p-3 lg:p-4 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center" style={{ borderColor: data.textColor }}>
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <div className="text-center font-bold text-xs sm:text-sm" style={{ color: data.textColor }}>
                          <div>YOUR</div>
                          <div>LOGO</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button 
                  onClick={handleDownload} 
                  className="w-full" 
                  variant="outline"
                  disabled={isDownloading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? 'Generating PDF...' : 'Download QR Code PDF'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Customization Panel */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customize Your QR Code</CardTitle>
                <CardDescription>
                  Personalize your QR code menu to match your brand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSave}>
                  {/* Heading */}
                  <div className="space-y-2">
                    <Label htmlFor="heading">Heading</Label>
                    <Input
                      id="heading"
                      value={data.heading}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setData('heading', e.target.value)}
                      placeholder="Menu"
                      disabled={processing}
                      className={errors?.heading ? 'border-red-500' : ''}
                    />
                    {errors?.heading && (
                      <p className="text-sm text-red-500">{errors.heading}</p>
                    )}
                  </div>

                  {/* Subheading */}
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="subheading">Subheading</Label>
                    <Textarea
                      id="subheading"
                      value={data.subheading}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData('subheading', e.target.value)}
                      placeholder="For a contactless menu, scan the QR code"
                      rows={3}
                      disabled={processing}
                      className={errors?.subheading ? 'border-red-500' : ''}
                    />
                    {errors?.subheading && (
                      <p className="text-sm text-red-500">{errors.subheading}</p>
                    )}
                  </div>

                  {/* Background Options */}
                  <div className="space-y-4 mt-4">
                    <Label>Background</Label>
                    
                    {/* Background Color */}
                    <div className="space-y-2">
                      <Label htmlFor="bg-color" className="text-sm text-gray-600">Solid Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="bg-color"
                          type="color"
                          value={data.backgroundColor}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setData('backgroundColor', e.target.value)}
                          className="w-20 h-10"
                          disabled={!!backgroundPreview || processing}
                        />
                        <Input
                          value={data.backgroundColor}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setData('backgroundColor', e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1"
                          disabled={!!backgroundPreview || processing}
                        />
                      </div>
                    </div>

                    {/* Background Image */}
                    <div className="space-y-2">
                      <Label className="text-sm text-gray-600">Or Background Image</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => backgroundInputRef.current?.click()}
                          className="flex-1"
                          disabled={processing}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {backgroundPreview ? 'Change Background' : 'Upload Background'}
                        </Button>
                        {backgroundPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={removeBackground}
                            disabled={processing}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <input
                        ref={backgroundInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />
                      {errors?.backgroundImage && (
                        <p className="text-sm text-red-500">{errors.backgroundImage}</p>
                      )}
                      {backgroundPreview && (
                        <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                          <img
                            src={backgroundPreview}
                            alt="Background preview"
                            className="w-full h-32 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={data.textColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('textColor', e.target.value)}
                        className="w-20 h-10"
                        disabled={processing}
                      />
                      <Input
                        value={data.textColor}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setData('textColor', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                        disabled={processing}
                      />
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2 mt-4">
                    <Label>Logo</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex-1"
                        disabled={processing}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      {logoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={removeLogo}
                          disabled={processing}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    {errors?.logo && (
                      <p className="text-sm text-red-500">{errors.logo}</p>
                    )}
                    {logoPreview && (
                      <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-24 h-24 object-contain mx-auto"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button type="submit" className="flex-1" disabled={processing}>
                      <Save className="w-4 h-4 mr-2" />
                      {processing ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetToDefault} 
                      disabled={processing}
                      className="sm:w-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Printing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• High-resolution PDF will be generated (8.5" x 11")</p>
                <p>• QR code will link to your business loyalty page</p>
                <p>• Print on standard 8.5" x 11" paper or cardstock</p>
                <p>• Test the QR code after printing to ensure it scans properly</p>
                <p>• Consider laminating for durability in high-traffic areas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

'use client';

import { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Youtube, Film, X, CheckCircle } from 'lucide-react';
import ProductVideo from './ProductVideo';

interface VideoUploaderProps {
  value?: string | null;
  onChange: (url: string | null, type: 'youtube' | 'vimeo' | 'direct') => void;
  label?: string;
}

/**
 * Componente para subir videos o pegar URLs de YouTube/Vimeo
 * Solo accesible para administradores (julii1295@gmail.com)
 */
export default function VideoUploader({
  value = null,
  onChange,
  label = 'Video del Producto',
}: VideoUploaderProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [videoUrl, setVideoUrl] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detectar tipo de video
  const detectVideoType = (url: string): 'youtube' | 'vimeo' | 'direct' => {
    if (!url) return 'direct';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    // Todo lo demás (incluye Supabase Storage, URLs directas, etc.)
    return 'direct';
  };

  // Manejar cambio de URL
  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    setError('');

    if (url.trim()) {
      const type = detectVideoType(url);
      onChange(url, type);
    } else {
      onChange(null, 'direct');
    }
  };

  // Subir video directo a Cloudflare R2 con URL prefirmada (sin límite de tamaño)
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError('');
      setUploadProgress(0);

      // Validar tipo de archivo (algunos celulares no reportan el MIME, se mira la extensión)
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['mp4', 'webm', 'mov', 'mkv', 'avi', '3gp'];
      if (!file.type.startsWith('video/') && !validExtensions.includes(extension)) {
        throw new Error('Formato no soportado. Usa MP4, WebM o MOV.');
      }

      const presignResponse = await fetch('/api/upload-video/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error preparando la subida del video');
      }

      const { uploadUrl, url, contentType } = await presignResponse.json();

      // XHR en vez de fetch para tener progreso real de subida
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Error subiendo el video (${xhr.status})`));
        xhr.onerror = () => reject(new Error('Error de red subiendo el video. Revisa tu conexión.'));
        xhr.send(file);
      });

      setUploadProgress(100);
      setVideoUrl(url);
      onChange(url, 'direct');

      // Resetear progreso después de 2 segundos
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Eliminar video
  const handleRemoveVideo = () => {
    setVideoUrl('');
    onChange(null, 'direct');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>

        {/* Switcher de método */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUploadMethod('url')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              uploadMethod === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <LinkIcon className="w-3 h-3 inline mr-1" />
            URL
          </button>
          <button
            type="button"
            onClick={() => setUploadMethod('file')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              uploadMethod === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Upload className="w-3 h-3 inline mr-1" />
            Subir
          </button>
        </div>
      </div>

      {/* Método URL */}
      {uploadMethod === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
            {videoUrl && (
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Eliminar video"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sugerencias */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
              💡 <strong>Formatos soportados:</strong>
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 ml-4">
              <li>• YouTube: https://www.youtube.com/watch?v=ABC123</li>
              <li>• YouTube corto: https://youtu.be/ABC123</li>
              <li>• Vimeo: https://vimeo.com/123456789</li>
            </ul>
          </div>

          {/* Tipo detectado */}
          {videoUrl && (
            <div className="flex items-center gap-2 text-sm">
              {detectVideoType(videoUrl) === 'youtube' && (
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <Youtube className="w-4 h-4" />
                  YouTube detectado
                </span>
              )}
              {detectVideoType(videoUrl) === 'vimeo' && (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <Film className="w-4 h-4" />
                  Vimeo detectado
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Método Subir Archivo */}
      {uploadMethod === 'file' && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!videoUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-blue-500 dark:hover:border-blue-400 transition-colors disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click para subir video
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    MP4, WebM, MOV • Videos del celular en cualquier resolución
                  </p>
                </div>
              </div>
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="absolute top-2 right-2 z-10 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Eliminar video"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Video subido correctamente</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 truncate">
                      {videoUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progreso de subida */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Subiendo video...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>
      )}

      {/* Vista previa del video */}
      {videoUrl && !uploading && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vista previa:
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono truncate">
            URL: {videoUrl}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Tipo detectado: <span className="font-semibold">{detectVideoType(videoUrl)}</span>
          </div>
          <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <ProductVideo
              videoUrl={videoUrl}
              videoType={detectVideoType(videoUrl)}
              productName="Vista previa"
              className="w-full h-full"
              autoPlay={false}
              controls={true}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-300">
            ❌ {error}
          </p>
        </div>
      )}
    </div>
  );
}

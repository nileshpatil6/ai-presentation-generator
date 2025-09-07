import React from 'react';
import { PreloadState } from '../types';
import { SpinnerIcon } from './icons/Icons';

interface PreloaderProps {
  state: PreloadState;
}

const ProgressBar: React.FC<{ loaded: number; total: number }> = ({ loaded, total }) => {
  const percentage = total > 0 ? (loaded / total) * 100 : 100;
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const Preloader: React.FC<PreloaderProps> = ({ state }) => {
  if (state.status !== 'loading') {
    return null;
  }

  const { images, audio } = state;

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Preparing Your Presentation...
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Fetching images and generating narration. This will only take a moment.
      </p>

      <div className="space-y-6">
        {images && images.total > 0 && (
          <div>
            <div className="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Fetching Images</span>
              <span>{images.loaded} / {images.total}</span>
            </div>
            <ProgressBar loaded={images.loaded} total={images.total} />
          </div>
        )}

        {audio && audio.total > 0 && (
          <div>
            <div className="flex justify-between mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Generating Audio</span>
              <span>{audio.loaded} / {audio.total}</span>
            </div>
            <ProgressBar loaded={audio.loaded} total={audio.total} />
          </div>
        )}
      </div>

      <div className="mt-8">
        <SpinnerIcon className="h-8 w-8 text-blue-500 mx-auto" />
      </div>
    </div>
  );
};

export default Preloader;

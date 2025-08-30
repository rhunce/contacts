import React, { useState } from 'react';
import { ApiKey } from '@/types/apiKey';

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  apiKey,
  onRevoke,
  onDelete,
  onRestore
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = () => {
    if (apiKey.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Revoked
        </span>
      );
    }
  };

  const getLastUsedText = () => {
    if (!apiKey.lastUsedAt) {
      return 'Never used';
    }
    
    const lastUsed = new Date(apiKey.lastUsedAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
            {getStatusBadge()}
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>Created: {formatDate(apiKey.createdAt)}</p>
            <p>Last used: {getLastUsedText()}</p>
            {apiKey.expiresAt && (
              <p>Expires: {formatDate(apiKey.expiresAt)}</p>
            )}
          </div>

          {apiKey.usageStats && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Requests</p>
                <p className="font-medium">{apiKey.usageStats.totalRequests.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">This Month</p>
                <p className="font-medium">{apiKey.usageStats.monthlyRequests.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Today</p>
                <p className="font-medium">{apiKey.usageStats.dailyRequests.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
              <div className="py-1">
                {apiKey.isActive ? (
                  <>
                    <button
                      onClick={() => {
                        onRevoke(apiKey.id);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Revoke Key
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onRestore(apiKey.id);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                    >
                      Restore Key
                    </button>
                    <button
                      onClick={() => {
                        onDelete(apiKey.id);
                        setShowActions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Delete Permanently
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning for revoked keys */}
      {!apiKey.isActive && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                This API key has been revoked and cannot be used for authentication.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyCard;

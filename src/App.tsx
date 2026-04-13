import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

export default function App() {
  const [lolPath, setLolPath] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  // 1. 处理选择文件夹
  const handleSelectPath = async () => {
    try {
      const selectedPath = await open({
        directory: true,
        multiple: false,
        title: '请选择包含 TCLS 的英雄联盟根目录',
      });
      
      if (selectedPath) {
        setLolPath(selectedPath as string);
        setStatus('idle');
        setMessage('');
      }
    } catch (err) {
      console.error("选择路径出错", err);
    }
  };

  // 2. 处理应用优化
  const handleApplyFix = async () => {
    if (!lolPath) {
      setStatus('error');
      setMessage('请先选择英雄联盟的安装目录！');
      return;
    }

    setStatus('loading');
    try {
      const res: string = await invoke('apply_fix', { lolPath });
      setStatus('success');
      setMessage(res);
    } catch (err: any) {
      setStatus('error');
      setMessage(err);
    }
  };

  return (
    // 移除了 flex-col，改为直接居中对齐，背景换成了极简的微渐变色
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] text-gray-800 font-sans flex items-center justify-center p-6 selection:bg-blue-100">
      
      <div className="w-full max-w-lg flex flex-col items-center">
        
        {/* 标题区：加入了闪电图标和渐变文字，更具科技感 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-5 shadow-sm border border-blue-100/50">
            <svg className="w-8 h-8 text-[#0067c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 mb-3 tracking-tight">
            使用原生启动器启动游戏
          </h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">
            一键物理锁死 WeGame，将控制权还给玩家
          </p>
        </div>

        
        <div className="bg-white/90 backdrop-blur-md w-full rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
            英雄联盟根目录
          </label>
          <div className="flex space-x-3 mb-6">
            <input
              type="text"
              readOnly
              value={lolPath}
              placeholder="例如: C:\Software\LOL\英雄联盟(26)"
              className="flex-1 block w-full rounded-xl border-gray-200 shadow-sm focus:border-[#0067c0] focus:ring-4 focus:ring-[#0067c0]/10 sm:text-sm px-4 py-3 bg-gray-50/50 text-gray-700 outline-none border transition-all placeholder:text-gray-400"
            />
            <button
              onClick={handleSelectPath}
              className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold transition-all border border-gray-200 shadow-sm hover:shadow active:scale-95 flex-shrink-0"
            >
              浏览
            </button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm font-medium transition-all duration-300 ease-in-out leading-relaxed whitespace-pre-line ${
                status === 'success'
                  ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                  : status === 'error'
                    ? 'bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]'
                    : ''
              }`}
            >
              {message}
            </div>
          )}

        
          <button
            onClick={handleApplyFix}
            disabled={status === 'loading' || !lolPath}
            className={`w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white focus:outline-none transition-all duration-200 ${
              !lolPath ? 'bg-gray-300 cursor-not-allowed shadow-none' :
              status === 'loading' ? 'bg-[#4093ff] cursor-wait' : 
              'bg-gradient-to-r from-[#0067c0] to-[#005a9e] hover:shadow-lg hover:shadow-[#0067c0]/20 hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {status === 'loading' ? '正在执行...' : '一键清理Wegame劫持文件'}
          </button>
        </div>

        {/* 底部版权 */}
        <div className="mt-12 text-xs text-gray-400 font-semibold tracking-widest uppercase">
          Designed by Mike Choi · Make LOL Great Again
        </div>
      </div>
    </div>
  );
}
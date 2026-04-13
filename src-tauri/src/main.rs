
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use mslnk::ShellLink;
use std::fs;
use std::path::Path; 

#[tauri::command]
fn apply_fix(lol_path: String) -> Result<String, String> {
    let base_path = Path::new(&lol_path);
    let tcls_path = base_path.join("TCLS");

    // 1. 验证路径准确性：根目录下必须有 TCLS 文件夹
    if !tcls_path.exists() || !tcls_path.is_dir() {
        return Err("路径错误：未找到 TCLS 文件夹。请确保选择的是包含 TCLS 的英雄联盟根目录！".into());
    }

    // 2. 锁定核心目标：TCLS 目录下的 wegame_launch.tmp
    let target_path = tcls_path.join("wegame_launch.tmp");

    // 3. 清理并锁死
    if target_path.exists() {
        if target_path.is_file() {
            fs::remove_file(&target_path).map_err(|e| format!("删除失败: {}", e))?;
        }
    }
    
    if !target_path.exists() {
        // 创建同名文件夹进行占位锁死
        fs::create_dir(&target_path).map_err(|e| format!("文件夹锁死失败: {}", e))?;
    }

    // 4. 定位原生启动器：Client.exe 位于 TCLS 目录下
    let client_exe = tcls_path.join("Client.exe");
    if !client_exe.exists() {
        return Ok("锁死成功！但在 TCLS 目录下未找到 Client.exe，无法自动创建快捷方式，请手动寻找。".into());
    }

    // 5. 获取当前 Windows 用户的桌面路径
    let user_profile = std::env::var("USERPROFILE").map_err(|_| "无法获取系统用户目录".to_string())?;
    let desktop_path = Path::new(&user_profile).join("Desktop").join("原生 LOL 启动.lnk");

    // 6. 生成快捷方式 (最终救赎版)
    let mut sl = ShellLink::new(&client_exe).map_err(|e| format!("初始化快捷方式失败: {}", e))?;
    
    // 设置工作目录为 TCLS，确保程序能正确加载资源
    sl.set_working_dir(Some(tcls_path.to_string_lossy().into_owned()));
    
    // 设置快捷方式备注
    sl.set_name(Some("Make League of Legends Great Again".to_string())); 
    
    // 写入桌面
    sl.create_lnk(desktop_path).map_err(|e| format!("写入快捷方式失败: {}", e))?;

    Ok("优化完成！\n已锁定 TCLS 下的 WeGame 劫持文件\n已生成原生启动器快捷方式至桌面".into())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init()) 
        .invoke_handler(tauri::generate_handler![apply_fix])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
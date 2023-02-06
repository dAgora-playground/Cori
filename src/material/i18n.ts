import i18next from 'i18next';

i18next
  .init({
    lng: '简体中文',
    resources: {
      EN: {
        translation: {
          'collecting': 'Collecting...',
          'push to notion': 'Pushing to Notion...',
          'notion success': '✅ Material pushed to Notion!',
          'notion error': ':negative_squared_cross_mark: Failed to push to Notion, please contact BOT administrator for assistance.',
          'push to chain': 'Pushing to Crossbell',
          'chain success': '✅ Material pushed to Crossbell! See:  https://crossbell.io/notes/{{characterId}}-{{noteId}}',
          'chain error': ':negative_squared_cross_mark: Failed to push to Crossbell, please contact BOT administrator for assistance.',
          'repeated': 'Repeated feeding',
          'confirm': '{{author}} thinks what you said is great, and wants to feed it to me. Click 👌 to confirm',
        },
      },
      '简体中文': {
        translation: {
          'collecting': '收藏中...',
          'push to notion': '素材添加 Notion 中...',
          'notion success': '✅ 素材碎片 Notion 添加成功!',
          'notion error': ':negative_squared_cross_mark: 添加 Notion 失败, 请联络 BOT 管理员协助处理。',
          'push to chain': '素材上链中',
          'chain success': '✅ 素材碎片上链成功！见:  https://crossbell.io/notes/{{characterId}}-{{noteId}}',
          'chain error': ':negative_squared_cross_mark: 上链失败，请联络 BOT 管理员协助处理。',
          'repeated': '重复投喂',
          'confirm': '{{author}} 觉得你说得很好，想让你投喂给我。请点👌确认',
        },
      },
      '繁體中文': {
        translation: {
          'collecting': '收藏中...',
          'push to notion': '素材添加 Notion 中...',
          'notion success': '✅ 素材碎片 Notion 添加成功!',
          'notion error': ':negative_squared_cross_mark: 添加到 Notion 失敗，請聯絡 BOT 管理員協助處理。',
          'push to chain': '素材上链中',
          'chain success': '✅ 素材碎片上鏈成功！見:  https://crossbell.io/notes/{{characterId}}-{{noteId}}',
          'chain error': ':negative_squared_cross_mark: 上鏈失敗，請聯絡 BOT 管理員協助處理。',
          'repeated': '重複投餵',
          'confirm': '{{author}} 覺得你說得很好，想讓妳投餵給我。請點👌確認',
        },
      }
    }
  });

export default i18next;
import React, {useCallback, useRef, useState} from 'react';
import {Card, Stack, Text, Button, Flex} from '@sanity/ui';
import {set, useClient, useFormValue} from 'sanity';

// ============================================================
// 2026-09-02 新增：产品资料 Word/txt 自动导入
//
// 约定的文件格式（每行一条，标签/内容用中英文冒号分隔都可以）：
//   标题：产品名称
//   描述：简短描述（一行）
//   二级分类：Flood Light（可选）
//   三级分类：Linear Flood Light（可选）
//   规格
//   Wattage: 30W 50W 100W 150W 200W
//   Lumens: 100-160LM/W
//   ...
//
// 不符合"标签：内容"格式的行（卖点列表、图片备注等）会被自动跳过，不会报错。
// "规格" 这一行本身是个开关——从这一行往下，所有 "标签: 值" 格式的行都会被
// 当成一条规格参数，写进 Specifications 参数表。
// ============================================================
function parseProductDoc(text) {
  const lines = text.split(/\r?\n/);
  let name = '';
  let shortDescription = '';
  let subCategory = '';
  let subSubCategory = '';
  const specs = [];
  let inSpecsSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const titleMatch = line.match(/^标题[:：]\s*(.+)$/);
    if (titleMatch) {
      name = titleMatch[1].trim();
      continue;
    }
    const descMatch = line.match(/^描述[:：]\s*(.+)$/);
    if (descMatch) {
      shortDescription = descMatch[1].trim();
      continue;
    }
    const subCatMatch = line.match(/^二级分类[:：]\s*(.+)$/);
    if (subCatMatch) {
      subCategory = subCatMatch[1].trim();
      continue;
    }
    const subSubCatMatch = line.match(/^三级分类[:：]\s*(.+)$/);
    if (subSubCatMatch) {
      subSubCategory = subSubCatMatch[1].trim();
      continue;
    }
    if (/^规格[:：]?$/.test(line)) {
      inSpecsSection = true;
      continue;
    }
    if (inSpecsSection) {
      const specMatch = line.match(/^([^:：]{1,40})[:：]\s*(.+)$/);
      if (specMatch) {
        specs.push({
          _type: 'specItem',
          _key: Math.random().toString(36).slice(2, 10),
          label: specMatch[1].trim(),
          value: specMatch[2].trim(),
        });
      }
    }
  }
  return {name, shortDescription, subCategory, subSubCategory, specs};
}

function slugifyText(str) {
  return (str || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductImportInput(props) {
  const {onChange} = props;
  const client = useClient({apiVersion: '2024-01-01'});
  const docId = useFormValue(['_id']);
  const category = useFormValue(['category']);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  // 2026-09-03：二级/三级分类改成了独立文档（引用字段）之后，这里改成
  // "按文字找同名分类，找不到就自动新建一个"——效果跟以前手打文字差不多方便，
  // 但建出来的是真正的分类文档，侧边栏"按分类浏览"和产品下拉选择都能用上，
  // 也不会再出现同一个分类因为打字不统一被拆成两条的问题（这里按精确匹配文字查找）。
  const findOrCreateSubCategory = useCallback(
    async (title, categoryValue) => {
      if (!title || !categoryValue) return null;
      const existingId = await client.fetch(
        `*[_type == "subCategory" && category == $cat && title == $title][0]._id`,
        {cat: categoryValue, title}
      );
      if (existingId) return existingId;
      const created = await client.create({
        _type: 'subCategory',
        title,
        slug: {_type: 'slug', current: slugifyText(title) || `subcategory-${Date.now()}`},
        category: categoryValue,
      });
      return created._id;
    },
    [client]
  );

  const findOrCreateSubSubCategory = useCallback(
    async (title, subCategoryId) => {
      if (!title || !subCategoryId) return null;
      const existingId = await client.fetch(
        `*[_type == "subSubCategory" && subCategory._ref == $scId && title == $title][0]._id`,
        {scId: subCategoryId, title}
      );
      if (existingId) return existingId;
      const created = await client.create({
        _type: 'subSubCategory',
        title,
        slug: {_type: 'slug', current: slugifyText(title) || `subsubcategory-${Date.now()}`},
        subCategory: {_type: 'reference', _ref: subCategoryId},
      });
      return created._id;
    },
    [client]
  );

  const handleFile = useCallback(
    async (fileList) => {
      const file = fileList && fileList[0];
      if (!file || !docId) return;
      setBusy(true);
      setStatus('正在解析文件…');
      try {
        let text = '';
        if (file.name.toLowerCase().endsWith('.docx')) {
          // 懒加载 mammoth（只有真的选了 .docx 文件才会加载这个库），
          // 这样即使这个库在某些环境下加载失败，也只影响"解析docx"这一步，
          // 不会导致整个产品编辑表单打不开
          const mammothModule = await import('mammoth/mammoth.browser.js');
          const mammoth = mammothModule.default || mammothModule;
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({arrayBuffer});
          text = result.value;
        } else {
          text = await file.text();
        }

        const {name, shortDescription, subCategory: subCatText, subSubCategory: subSubCatText, specs} = parseProductDoc(text);
        if (!name && !shortDescription && !subCatText && !subSubCatText && specs.length === 0) {
          setStatus('没有识别到任何内容，请检查文件里是否有"标题：""描述：""规格"这几行标记');
          setBusy(false);
          return;
        }
        if ((subCatText || subSubCatText) && !category) {
          setStatus('文件里写了二级/三级分类，但上面的"一级分类 Category"字段还没选——请先选好一级分类再导入文件（分类要挂在对应的一级分类下面才能建）。');
          setBusy(false);
          return;
        }

        const patch = {};
        if (name) patch.name = name;
        if (shortDescription) patch.shortDescription = shortDescription;
        if (specs.length > 0) patch.specs = specs;

        let subCategoryId = null;
        if (subCatText) {
          setStatus('正在查找/新建二级分类…');
          subCategoryId = await findOrCreateSubCategory(subCatText, category);
          if (subCategoryId) patch.subCategory = {_type: 'reference', _ref: subCategoryId};
        }
        if (subSubCatText && subCategoryId) {
          setStatus('正在查找/新建三级分类…');
          const subSubCategoryId = await findOrCreateSubSubCategory(subSubCatText, subCategoryId);
          if (subSubCategoryId) patch.subSubCategory = {_type: 'reference', _ref: subSubCategoryId};
        }

        await client.patch(docId).set(patch).commit({autoGenerateArrayKeys: true});

        onChange(set(`${file.name} · ${new Date().toLocaleString('zh-CN')}`));

        const parts = [];
        if (name) parts.push('标题 ✓');
        if (shortDescription) parts.push('描述 ✓');
        if (patch.subCategory) parts.push('二级分类 ✓');
        if (patch.subSubCategory) parts.push('三级分类 ✓');
        if (specs.length > 0) parts.push(`参数 ${specs.length} 条 ✓`);
        setStatus(`已自动填入：${parts.join('  ')}，请往下检查各字段是否正确`);
      } catch (e) {
        setStatus('解析失败：' + (e && e.message ? e.message : '未知错误'));
      } finally {
        setBusy(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [client, docId, category, onChange, findOrCreateSubCategory, findOrCreateSubSubCategory]
  );

  return (
    <Card padding={3} radius={2} tone="primary" border style={{borderStyle: 'dashed'}}>
      <Stack space={3}>
        <Text size={1} weight="semibold">
          📄 从 Word / txt 文件自动导入产品信息
        </Text>
        <Text size={1} muted>
          文件里第一行写「标题：产品名称」，第二行写「描述：简短描述」，可以再加「二级分类：」「三级分类：」
          （都是可选的，但如果写了这两项，请先在下面选好"一级分类 Category"再导入——分类要挂在对应一级分类下面），
          然后另起一行写「规格」，下面每行一条「参数名: 参数值」。选好文件后会自动识别并填入对应字段（如果
          二级/三级分类还没建过，会自动新建；已经建过同名的会直接复用，不会重复建），其余内容（卖点列表、
          图片备注等）会自动忽略，不会出错。填完后请往下检查一遍，确认无误再发布。
        </Text>
        <Flex align="center" gap={3} wrap="wrap">
          <Button
            text={busy ? '解析中…' : '选择 Word(.docx) / txt 文件'}
            tone="primary"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={busy || !docId}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt"
            style={{display: 'none'}}
            onChange={(e) => handleFile(e.target.files)}
          />
          {status && <Text size={1}>{status}</Text>}
        </Flex>
      </Stack>
    </Card>
  );
}

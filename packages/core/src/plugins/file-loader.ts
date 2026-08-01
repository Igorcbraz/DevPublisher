import * as fs from 'node:fs';
import * as path from 'node:path';
import matter from 'gray-matter';
import { LoaderPlugin } from '../registry/loader-registry.js';
import { BlogPost } from '../models/blog-post.js';
import { FrontmatterSchema } from '../models/frontmatter.js';
import { SourceConfig } from '../models/config.js';

export class FileLoaderPlugin implements LoaderPlugin {
  readonly id = 'file-loader';
  readonly name = 'File System Loader';
  readonly version = '1.0.0';
  readonly type = 'loader';
  readonly description = 'Loads Markdown files from local file system';

  async load(config: SourceConfig): Promise<BlogPost[]> {
    const posts: BlogPost[] = [];
    const filesToProcess: string[] = [];

    if (config.files && config.files.length > 0) {
      filesToProcess.push(...config.files);
    } else if (config.folder) {
      const folderPath = path.resolve(process.cwd(), config.folder);
      if (fs.existsSync(folderPath)) {
        const entries = fs.readdirSync(folderPath, { recursive: true, withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith('.md')) {
            const fullPath = path.join(entry.parentPath || entry.path || folderPath, entry.name);
            filesToProcess.push(fullPath);
          }
        }
      }
    }

    for (const filePath of filesToProcess) {
      if (!fs.existsSync(filePath)) continue;
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(rawContent);

      const parsedFrontmatter = FrontmatterSchema.safeParse(data);
      const frontmatter = parsedFrontmatter.success ? parsedFrontmatter.data : (data as any);

      posts.push(
        new BlogPost({
          filePath,
          frontmatter,
          content,
          rawContent
        })
      );
    }

    return posts;
  }
}

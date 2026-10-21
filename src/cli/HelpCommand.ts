import { Command, CommandCategory, CommandResult, ok } from '../command/Command.js';

export class HelpCommand implements Command {
  readonly kind = 'help';
  readonly category = CommandCategory.Display;

  execute(): CommandResult {
    return ok(HELP_TEXT);
  }

  undo(): CommandResult {
    return ok('help: nothing to undo');
  }

  redo(): CommandResult {
    return ok('help: nothing to redo');
  }
}

const HELP_TEXT = `Commands:
  init [w] [h]                      新建空画布（默认 800x600）
  read <file.svg>                   读入 SVG 文件
  save [file.svg]                   保存当前文档
  canvas [w] [h]                    显示/修改画布尺寸
  create <type> <id> [params] [in <containerId>]
                                    创建图形（rect/circle/ellipse/line/text/g）
  delete <id>                       删除图形
  move <id> <dx> <dy>               平移
  scale <id> <factor>               等比缩放
  set <id> <attr> <value>           设置属性
  group <newGid> <id1> <id2> ...    新建容器并收入图形
  ungroup <gid>                     解散容器
  addto <gid> <id>                  把图形移入容器
  front <id> | back <id>            调整 z-order
  tree [id]                         结构树
  show <id>                         图形属性明细
  undo | redo                       撤销/重做
  help                              显示本帮助`;

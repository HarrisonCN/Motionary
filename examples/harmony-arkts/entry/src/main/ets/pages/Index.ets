// Motionary presets in ArkUI: bind a UsaFrame to a component's attributes and animate it with usaAnimate().
import { USA_PRESETS, UsaFrame, usaAnimate } from '../motion/Motionary';

@Entry
@Component
struct Index {
  @State frame: UsaFrame = USA_PRESETS['fade-in-up'].from;
  @State preset: string = 'fade-in-up';
  @State reduceMotion: boolean = false;

  play(name: string) {
    this.preset = name;
    usaAnimate(USA_PRESETS[name], (f: UsaFrame) => { this.frame = f; }, { duration: 'slow', curve: 'emphasized', reduceMotion: this.reduceMotion });
  }

  aboutToAppear() { this.play('fade-in-up'); }

  build() {
    Column({ space: 16 }) {
      Column() {
        Text('Motionary').fontSize(28).fontWeight(FontWeight.Bold).fontColor('#e8ecf3')
        Text(this.preset).fontSize(14).fontColor('#9aa3b2')
      }
      .padding(24).borderRadius(16).backgroundColor('#161a23')
      .opacity(this.frame.opacity ?? 1)
      .translate({ x: this.frame.tx ?? 0, y: this.frame.ty ?? 0 })
      .scale({ x: this.frame.sx ?? 1, y: this.frame.sy ?? 1 })
      .rotate({ z: 1, angle: this.frame.rz ?? 0 })
      .blur(this.frame.blur ?? 0)

      Row({ space: 8 }) {
        Button('fade-in-up').onClick(() => this.play('fade-in-up'))
        Button('zoom-in').onClick(() => this.play('zoom-in'))
        Button('rotate-in').onClick(() => this.play('rotate-in'))
      }
      Toggle({ type: ToggleType.Switch, isOn: this.reduceMotion }).onChange((on: boolean) => { this.reduceMotion = on; })
    }
    .width('100%').height('100%').justifyContent(FlexAlign.Center).backgroundColor('#0b0d12')
  }
}

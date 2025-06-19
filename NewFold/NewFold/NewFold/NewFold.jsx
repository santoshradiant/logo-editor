import { useState } from "react";
import { BuilderTopbarRedo } from "../BuilderTopbarRedo/BuilderTopbarRedo";
import { BuilderTopbarUndo } from "../BuilderTopbarUndo/BuilderTopbarUndo";
import { Check } from "../Check/Check";
import { Close } from "../Close/Close";
import { Fill1 } from "../Fill1/Fill1";
import { Line1 } from "../Line1/Line1";
import { Line6 } from "../Line6/Line6";
import { OneThousandNineHundredAndTwenty } from "../OneThousandNineHundredAndTwenty/OneThousandNineHundredAndTwenty";
import { Palette } from "../Palette/Palette";
import { PublishMenu } from "../PublishMenu/PublishMenu";
import { Resources } from "../Resources/Resources";
import { Shape } from "../Shape/Shape";
import { Slogan } from "../Slogan/Slogan";
import { StencilTop } from "../StencilTop/StencilTop";
import { Text } from "../Text/Text";
import { Union } from "../Union/Union";
import screenshot20250605At105751Am1 from "./screenshot-2025-06-05-at-10-57-51-AM-1.png";
import "./style.css";

export default function LogoBuilderColor() {
  const [selectedColorPalette, setSelectedColorPalette] = useState(0);
  const [hoveredPalette, setHoveredPalette] = useState(null);
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#007a33");

  // Color palette data
  const colorPalettes = [
    { primary: "#58bdd9", secondary: "#000000" },
    { primary: "#c72c1a", secondary: "#fdd20a" },
    { primary: "#fed662", secondary: "#00539c" },
    { primary: "#9e0f30", secondary: "#e9877e" },
    { primary: "#da5a2a", secondary: "#3b1876" },
    { primary: "#02343f", secondary: "#efedcb" },
    { primary: "#06553b", secondary: "#ced469" },
    { primary: "#606060", secondary: "#d5ec16" },
    { primary: "#18518f", secondary: "#a2a2a1" },
    { primary: "#00203f", secondary: "#adefd1" },
    { primary: "#1e4173", secondary: "#dda94a" },
    { primary: "#0162b1", secondary: "#9cc3d5" },
    { primary: "#76528a", secondary: "#cbce91" },
    { primary: "#412057", secondary: "#fbf950" },
    { primary: "#49274f", secondary: "#efa07a" },
    { primary: "#000000", secondary: "#a2a2a1" }
  ];

  const handleColorPaletteSelect = (index) => {
    setSelectedColorPalette(index);
  };

  const handleCustomColorClick = () => {
    setShowCustomColorPicker(!showCustomColorPicker);
  };

  const handleDownload = () => {
    // Download functionality
    console.log("Download clicked");
  };

  const handlePublish = () => {
    // Publish functionality
    console.log("Publish clicked");
  };
  return (
    <div className="logo-builder-color">
      <div className="overlap">
        <div className="logo-builder-desktop">
          <div className="overlap-group">
            <div className="editor-pane">
              <div className="color">
                <div className="div">
                  <div className="text-wrapper">Define your brand’s tone</div>

                  <p className="p">
                    From vibrant to minimal, we’ve got ready-made palettes to
                    get you started, or create your own if you have something
                    specific in mind.
                  </p>
                </div>

                <div className="color-selector">
                  <div className="div">
                    <div className="text-wrapper-2">Recommended Colors</div>

                    <div className="element-color-palettes">
                      {Array.from({ length: 4 }, (_, rowIndex) => (
                        <div key={rowIndex} className="row">
                          {colorPalettes.slice(rowIndex * 4, (rowIndex + 1) * 4).map((palette, colIndex) => {
                            const paletteIndex = rowIndex * 4 + colIndex;
                            const isSelected = selectedColorPalette === paletteIndex;
                            const isHovered = hoveredPalette === paletteIndex;

                            return (
                              <div key={paletteIndex} className="color-swatch-container">
                                <div
                                  className={`color-swatch ${rowIndex === 0 && colIndex === 0 ? '' : 'color-swatch-2'} ${isHovered ? 'hovered' : ''}`}
                                  onClick={() => handleColorPaletteSelect(paletteIndex)}
                                  onMouseEnter={() => setHoveredPalette(paletteIndex)}
                                  onMouseLeave={() => setHoveredPalette(null)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div
                                    className="color-primary"
                                    style={{ backgroundColor: palette.primary }}
                                  />
                                  <div
                                    className="color-secondary"
                                    style={{ backgroundColor: palette.secondary }}
                                  />
                                </div>
                                {isSelected && (
                                  <div className="selected">
                                    <div className="white-stroke-wrapper">
                                      <div className="white-stroke" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="custom-color">
                    <div className="text-wrapper-2">Custom Color</div>

                    <div className="custom-button">
                      <div className="static">
                        <div
                          className="frame"
                          onClick={handleCustomColorClick}
                          style={{ cursor: 'pointer' }}
                        >
                          <Fill1 className="fill" />
                          <div className="text-wrapper-3">Custom</div>
                        </div>
                      </div>
                    </div>

                    {showCustomColorPicker && (
                      <div className="custom-color-picker">
                        <input
                          type="color"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="color-input"
                        />
                        <span className="color-value">{customColor}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="center-preview">
              <div className="frame-wrapper">
                <div className="frame-2" />
              </div>

              <div className="publish-state">
                <div className="first">
                  <div className="title-tags">
                    <div className="builder-tag">
                      <div className="text-wrapper-4">Published</div>
                    </div>

                    <p className="text-wrapper-5">May 08, 2025 - 5:20 PM</p>
                  </div>
                </div>

                <PublishMenu className="publish-menu-instance" state="idle" />
              </div>
            </div>

            <div className="app-header">
              <div className="element-wrapper">
                <OneThousandNineHundredAndTwenty className="element" />
              </div>

              <div className="frame-3">
                <div className="frame-4">
                  <div className="div-2">
                    <BuilderTopbarUndo
                      className="builder-topbar-undo-instance"
                      state="idle"
                    />
                  </div>

                  <div className="div-2">
                    <BuilderTopbarRedo
                      className="builder-topbar-redo-instance"
                      state="idle"
                    />
                  </div>
                </div>

                <Line1 className="line" />
                <div className="div-2">
                  <div className="icon-instance-node">
                    <div className="idle">
                      <img className="vector" alt="Vector" />

                      <div className="overlap-group-2">
                        <Check className="check-instance" />
                        <Union className="union-instance" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-set">
                <button
                  className="download-button"
                  onClick={handleDownload}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <div className="next-social-links">Download</div>
                </button>

                <button
                  className="publish-button"
                  onClick={handlePublish}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#005a24'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--am-brand-amm-theme-primary)'}
                >
                  <div className="next-social-links-2">Publish</div>
                </button>
              </div>
            </div>

            <Close className="close-instance" />
            <div className="logo-builder">
              <div className="top">
                <div className="hover-top" />

                <div className="hover-top-2" />

                <div className="hover-top-3" />

                <div className="hover-top-4" />

                <div className="hover-top-5" />

                <StencilTop className="stencil-top" />
                <div className="logo-builder-left">
                  <Text className="icon-instance-node" />
                </div>

                <Slogan className="slogan-instance" />
                <div className="logo-builder-left">
                  <Resources className="icon-instance-node" />
                </div>

                <div className="logo-builder-left">
                  <div className="icon-instance-node">
                    <Shape className="shape-instance" />
                  </div>
                </div>

                <div className="icon-palette-wrapper">
                  <Palette className="icon-instance-node" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="logo-preview-image">
          <div className="logo-preview-image-2">
            <div className="frame-5">
              <img
                className="screenshot"
                alt="Screenshot"
                src={screenshot20250605At105751Am1}
              />
            </div>

            <div className="group">
              <div className="overlap-group-3">
                <div className="URBAN-ART-FIGURES-wrapper">
                  <p className="URBAN-ART-FIGURES">
                    <span className="span">
                      URBAN
                      <br />
                    </span>

                    <span className="text-wrapper-6">ART FIGURES</span>
                  </p>
                </div>

                <div className="frame-6">
                  <div className="line-wrapper">
                    <Line6 className="line-6" />
                  </div>

                  <div className="text-wrapper-7">CUSTOM DESIGNER TOYS</div>

                  <div className="line-wrapper">
                    <Line6 className="line-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
